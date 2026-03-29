const express = require('express');
const router = express.Router();
const { query, pool } = require('../db');

// GET search cards (MUST be before /:id)
router.get('/search/query', async (req, res) => {
  try {
    const { q, board_id, label_id, member_id, due } = req.query;

    let cardsResult;
    if (board_id) {
      cardsResult = await query(`
        SELECT c.*, l.title as list_title, l.board_id
        FROM cards c
        JOIN lists l ON c.list_id = l.id
        WHERE c.is_archived = FALSE AND l.board_id = $1
        ORDER BY c.updated_at DESC
      `, [board_id]);
    } else {
      cardsResult = await query(`
        SELECT c.*, l.title as list_title, l.board_id, b.title as board_title
        FROM cards c
        JOIN lists l ON c.list_id = l.id
        JOIN boards b ON l.board_id = b.id
        WHERE c.is_archived = FALSE
        ORDER BY c.updated_at DESC
      `);
    }

    let filtered = cardsResult.rows;

    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(lower) ||
        (c.description && c.description.toLowerCase().includes(lower))
      );
    }

    if (label_id) {
      const lid = parseInt(label_id);
      const newFiltered = [];
      for (const c of filtered) {
        const labelsRes = await query('SELECT label_id FROM card_labels WHERE card_id = $1', [c.id]);
        if (labelsRes.rows.some(l => l.label_id === lid)) {
          newFiltered.push(c);
        }
      }
      filtered = newFiltered;
    }

    if (member_id) {
      const mid = parseInt(member_id);
      const newFiltered = [];
      for (const c of filtered) {
        const membersRes = await query('SELECT member_id FROM card_members WHERE card_id = $1', [c.id]);
        if (membersRes.rows.some(m => m.member_id === mid)) {
          newFiltered.push(c);
        }
      }
      filtered = newFiltered;
    }

    if (due === 'overdue') {
      const now = new Date().toISOString();
      filtered = filtered.filter(c => c.due_date && !c.due_complete && c.due_date < now);
    } else if (due === 'soon') {
      const now = new Date();
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      filtered = filtered.filter(c => c.due_date && !c.due_complete && c.due_date >= now.toISOString() && c.due_date <= threeDays);
    } else if (due === 'complete') {
      filtered = filtered.filter(c => c.due_complete);
    }

    // Attach labels and members
    const results = [];
    for (const card of filtered) {
      const labelsRes = await query(`
        SELECT l.* FROM labels l
        JOIN card_labels cl ON l.id = cl.label_id
        WHERE cl.card_id = $1
      `, [card.id]);

      const membersRes = await query(`
        SELECT m.* FROM members m
        JOIN card_members cm ON m.id = cm.member_id
        WHERE cm.card_id = $1
      `, [card.id]);

      results.push({ ...card, labels: labelsRes.rows, members: membersRes.rows });
    }

    res.json(results.slice(0, 50));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single card with all details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cardResult = await query(`
      SELECT c.*, l.title as list_title, l.board_id
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      WHERE c.id = $1
    `, [id]);

    if (cardResult.rows.length === 0) return res.status(404).json({ error: 'Card not found' });
    const card = cardResult.rows[0];

    const labelsResult = await query('SELECT l.* FROM labels l JOIN card_labels cl ON l.id = cl.label_id WHERE cl.card_id = $1', [id]);
    const membersResult = await query('SELECT m.* FROM members m JOIN card_members cm ON m.id = cm.member_id WHERE cm.card_id = $1', [id]);

    const checklistsResult = await query('SELECT * FROM checklists WHERE card_id = $1 ORDER BY position', [id]);
    const checklistsWithItems = [];
    for (const cl of checklistsResult.rows) {
      const itemsResult = await query('SELECT * FROM checklist_items WHERE checklist_id = $1 ORDER BY position', [cl.id]);
      checklistsWithItems.push({ ...cl, items: itemsResult.rows });
    }

    const commentsResult = await query(`
      SELECT c.*, m.full_name, m.initials, m.avatar_color
      FROM comments c LEFT JOIN members m ON c.member_id = m.id
      WHERE c.card_id = $1 ORDER BY c.created_at DESC
    `, [id]);

    const attachmentsResult = await query(`
      SELECT a.*, m.full_name as uploaded_by_name
      FROM attachments a LEFT JOIN members m ON a.uploaded_by = m.id
      WHERE a.card_id = $1 ORDER BY a.created_at DESC
    `, [id]);

    const activityResult = await query(`
      SELECT al.*, m.full_name, m.initials, m.avatar_color
      FROM activity_log al LEFT JOIN members m ON al.member_id = m.id
      WHERE al.card_id = $1 ORDER BY al.created_at DESC LIMIT 20
    `, [id]);

    res.json({
      ...card,
      labels: labelsResult.rows,
      members: membersResult.rows,
      checklists: checklistsWithItems,
      comments: commentsResult.rows,
      attachments: attachmentsResult.rows,
      activity: activityResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create card
router.post('/', async (req, res) => {
  try {
    const { list_id, title } = req.body;
    const maxPosResult = await query('SELECT COALESCE(MAX(position), 0) + 1000 as pos FROM cards WHERE list_id = $1', [list_id]);
    const pos = maxPosResult.rows[0].pos;

    const cardResult = await query(
      'INSERT INTO cards (list_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [list_id, title, pos]
    );
    const card = cardResult.rows[0];

    const listResult = await query('SELECT board_id FROM lists WHERE id = $1', [list_id]);
    await query(
      'INSERT INTO activity_log (board_id, card_id, member_id, action_type, description) VALUES ($1, $2, 1, $3, $4)',
      [listResult.rows[0].board_id, card.id, 'card_create', `Created card "${title}"`]
    );

    res.status(201).json({ ...card, labels: [], members: [], checklist_total: 0, checklist_done: 0, comment_count: 0, attachment_count: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update card
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingResult = await query('SELECT * FROM cards WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Card not found' });
    const existing = existingResult.rows[0];

    const { title, description, list_id, position, due_date, due_complete, cover_color, is_archived } = req.body;

    const updatedResult = await query(
      `UPDATE cards SET
        title = $1, description = $2, list_id = $3, position = $4,
        due_date = $5, due_complete = $6, cover_color = $7, is_archived = $8,
        updated_at = NOW() WHERE id = $9 RETURNING *`,
      [
        title !== undefined ? title : existing.title,
        description !== undefined ? description : existing.description,
        list_id !== undefined ? list_id : existing.list_id,
        position !== undefined ? position : existing.position,
        due_date !== undefined ? due_date : existing.due_date,
        due_complete !== undefined ? due_complete : existing.due_complete,
        cover_color !== undefined ? cover_color : existing.cover_color,
        is_archived !== undefined ? is_archived : existing.is_archived,
        id
      ]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reorder cards
router.put('/reorder/batch', async (req, res) => {
  try {
    const { cards } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of cards) {
        await client.query('UPDATE cards SET list_id = $1, position = $2, updated_at = NOW() WHERE id = $3', [item.list_id, item.position, item.id]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ message: 'Cards reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE card
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM cards WHERE id = $1', [req.params.id]);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add label to card
router.post('/:id/labels', async (req, res) => {
  try {
    await query('INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, req.body.label_id]);
    res.json({ message: 'Label added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove label
router.delete('/:id/labels/:labelId', async (req, res) => {
  try {
    await query('DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2', [req.params.id, req.params.labelId]);
    res.json({ message: 'Label removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add member
router.post('/:id/members', async (req, res) => {
  try {
    await query('INSERT INTO card_members (card_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.id, req.body.member_id]);
    const memberResult = await query('SELECT * FROM members WHERE id = $1', [req.body.member_id]);
    res.json(memberResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove member
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    await query('DELETE FROM card_members WHERE card_id = $1 AND member_id = $2', [req.params.id, req.params.memberId]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add checklist
router.post('/:id/checklists', async (req, res) => {
  try {
    const { title = 'Checklist' } = req.body;
    const maxPosResult = await query('SELECT COALESCE(MAX(position), 0) + 1000 as pos FROM checklists WHERE card_id = $1', [req.params.id]);
    const clResult = await query(
      'INSERT INTO checklists (card_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, title, maxPosResult.rows[0].pos]
    );
    res.status(201).json({ ...clResult.rows[0], items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE checklist
router.delete('/:cardId/checklists/:id', async (req, res) => {
  try {
    await query('DELETE FROM checklists WHERE id = $1', [req.params.id]);
    res.json({ message: 'Checklist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST checklist item
router.post('/:cardId/checklists/:checklistId/items', async (req, res) => {
  try {
    const { title } = req.body;
    const maxPosResult = await query('SELECT COALESCE(MAX(position), 0) + 1000 as pos FROM checklist_items WHERE checklist_id = $1', [req.params.checklistId]);
    const itemResult = await query(
      'INSERT INTO checklist_items (checklist_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [req.params.checklistId, title, maxPosResult.rows[0].pos]
    );
    res.status(201).json(itemResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update checklist item
router.put('/:cardId/checklists/:checklistId/items/:itemId', async (req, res) => {
  try {
    const existingResult = await query('SELECT * FROM checklist_items WHERE id = $1', [req.params.itemId]);
    const existing = existingResult.rows[0];
    const { title, is_checked } = req.body;

    const updatedResult = await query(
      'UPDATE checklist_items SET title = $1, is_checked = $2 WHERE id = $3 RETURNING *',
      [
        title !== undefined ? title : existing.title,
        is_checked !== undefined ? is_checked : existing.is_checked,
        req.params.itemId
      ]
    );
    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE checklist item
router.delete('/:cardId/checklists/:checklistId/items/:itemId', async (req, res) => {
  try {
    await query('DELETE FROM checklist_items WHERE id = $1', [req.params.itemId]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, member_id = 1 } = req.body;
    const commentResult = await query(
      'INSERT INTO comments (card_id, member_id, text) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, member_id, text]
    );
    const memberResult = await query('SELECT full_name, initials, avatar_color FROM members WHERE id = $1', [member_id]);
    res.status(201).json({ ...commentResult.rows[0], ...memberResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE comment
router.delete('/:cardId/comments/:id', async (req, res) => {
  try {
    await query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
