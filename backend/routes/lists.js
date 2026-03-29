const express = require('express');
const router = express.Router();
const { query, pool } = require('../db');

// POST create list
router.post('/', async (req, res) => {
  try {
    const { board_id, title } = req.body;
    const maxPosResult = await query('SELECT COALESCE(MAX(position), 0) + 1000 as pos FROM lists WHERE board_id = $1', [board_id]);
    const listResult = await query(
      'INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [board_id, title, maxPosResult.rows[0].pos]
    );
    res.status(201).json({ ...listResult.rows[0], cards: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update list
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingResult = await query('SELECT * FROM lists WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'List not found' });
    const existing = existingResult.rows[0];

    const { title, position, is_archived } = req.body;
    const updatedResult = await query(
      'UPDATE lists SET title = $1, position = $2, is_archived = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [
        title !== undefined ? title : existing.title,
        position !== undefined ? position : existing.position,
        is_archived !== undefined ? is_archived : existing.is_archived,
        id
      ]
    );
    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reorder lists
router.put('/reorder/batch', async (req, res) => {
  try {
    const { lists } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of lists) {
        await client.query('UPDATE lists SET position = $1 WHERE id = $2', [item.position, item.id]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ message: 'Lists reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE list
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM lists WHERE id = $1', [req.params.id]);
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
