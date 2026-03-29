const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all boards
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT b.*, m.full_name as creator_name,
        (SELECT COUNT(*) FROM lists l WHERE l.board_id = b.id AND l.is_archived = FALSE) as list_count,
        (SELECT COUNT(*) FROM cards c JOIN lists l ON c.list_id = l.id WHERE l.board_id = b.id AND c.is_archived = FALSE) as card_count
      FROM boards b
      LEFT JOIN members m ON b.created_by = m.id
      ORDER BY b.is_starred DESC, b.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single board with all data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const boardResult = await query('SELECT * FROM boards WHERE id = $1', [id]);
    if (boardResult.rows.length === 0) return res.status(404).json({ error: 'Board not found' });
    const board = boardResult.rows[0];

    // Members
    const membersResult = await query(`
      SELECT m.* FROM members m
      JOIN board_members bm ON m.id = bm.member_id
      WHERE bm.board_id = $1
    `, [id]);

    // Lists
    const listsResult = await query('SELECT * FROM lists WHERE board_id = $1 AND is_archived = FALSE ORDER BY position', [id]);

    const lists = [];
    for (const list of listsResult.rows) {
      const cardsResult = await query('SELECT * FROM cards WHERE list_id = $1 AND is_archived = FALSE ORDER BY position', [list.id]);

      const cardsWithDetails = [];
      for (const card of cardsResult.rows) {
        const labelsResult = await query(`
          SELECT l.* FROM labels l
          JOIN card_labels cl ON l.id = cl.label_id
          WHERE cl.card_id = $1
        `, [card.id]);

        const cardMembersResult = await query(`
          SELECT m.* FROM members m
          JOIN card_members cm ON m.id = cm.member_id
          WHERE cm.card_id = $1
        `, [card.id]);

        const checklistTotalResult = await query(`
          SELECT COUNT(*) as count FROM checklist_items ci
          JOIN checklists ch ON ci.checklist_id = ch.id
          WHERE ch.card_id = $1
        `, [card.id]);

        const checklistDoneResult = await query(`
          SELECT COUNT(*) as count FROM checklist_items ci
          JOIN checklists ch ON ci.checklist_id = ch.id
          WHERE ch.card_id = $1 AND ci.is_checked = TRUE
        `, [card.id]);

        const commentCountResult = await query('SELECT COUNT(*) as count FROM comments WHERE card_id = $1', [card.id]);
        const attachmentCountResult = await query('SELECT COUNT(*) as count FROM attachments WHERE card_id = $1', [card.id]);

        cardsWithDetails.push({
          ...card,
          labels: labelsResult.rows,
          members: cardMembersResult.rows,
          checklist_total: parseInt(checklistTotalResult.rows[0].count),
          checklist_done: parseInt(checklistDoneResult.rows[0].count),
          comment_count: parseInt(commentCountResult.rows[0].count),
          attachment_count: parseInt(attachmentCountResult.rows[0].count),
        });
      }

      lists.push({ ...list, cards: cardsWithDetails });
    }

    // Labels
    const labelsResult = await query('SELECT * FROM labels WHERE board_id = $1', [id]);

    res.json({ ...board, members: membersResult.rows, lists, labels: labelsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create board
router.post('/', async (req, res) => {
  try {
    const { title, background_color = '#0079BF', background_image = null } = req.body;
    const boardResult = await query(
      'INSERT INTO boards (title, background_color, background_image, created_by) VALUES ($1, $2, $3, 1) RETURNING *',
      [title, background_color, background_image]
    );
    const board = boardResult.rows[0];

    await query('INSERT INTO board_members (board_id, member_id) VALUES ($1, 1)', [board.id]);

    // Default labels
    const defaultLabels = [
      { name: '', color: '#61BD4F' }, { name: '', color: '#F2D600' },
      { name: '', color: '#FF9F1A' }, { name: '', color: '#EB5A46' },
      { name: '', color: '#C377E0' }, { name: '', color: '#0079BF' },
    ];
    for (const l of defaultLabels) {
      await query('INSERT INTO labels (board_id, name, color) VALUES ($1, $2, $3)', [board.id, l.name, l.color]);
    }

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update board
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const boardResult = await query('SELECT * FROM boards WHERE id = $1', [id]);
    if (boardResult.rows.length === 0) return res.status(404).json({ error: 'Board not found' });
    const board = boardResult.rows[0];

    const { title, background_color, background_image, is_starred, visibility } = req.body;

    const updatedResult = await query(
      `UPDATE boards SET title = $1, background_color = $2, background_image = $3, visibility = $4, is_starred = $5, updated_at = NOW() WHERE id = $6 RETURNING *`,
      [
        title !== undefined ? title : board.title,
        background_color !== undefined ? background_color : board.background_color,
        background_image !== undefined ? background_image : board.background_image,
        visibility !== undefined ? visibility : board.visibility,
        is_starred !== undefined ? is_starred : board.is_starred,
        id
      ]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE board
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM boards WHERE id = $1', [req.params.id]);
    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD board member
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id } = req.body;
    await query('INSERT INTO board_members (board_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, member_id]);
    const memberResult = await query('SELECT * FROM members WHERE id = $1', [member_id]);
    res.json(memberResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD board member by email
router.post('/:id/members/invite', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Find member by email
    const memberResult = await query('SELECT * FROM members WHERE email = $1', [email]);
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'User with this email not found' });
    }
    
    const member = memberResult.rows[0];
    await query('INSERT INTO board_members (board_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, member.id]);
    
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
