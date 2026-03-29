const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET labels for a board
router.get('/board/:boardId', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM labels WHERE board_id = $1 ORDER BY id', [req.params.boardId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create label
router.post('/', async (req, res) => {
  try {
    const { board_id, name, color } = req.body;
    const result = await query(
      'INSERT INTO labels (board_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [board_id, name, color]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update label
router.put('/:id', async (req, res) => {
  try {
    const existingResult = await query('SELECT * FROM labels WHERE id = $1', [req.params.id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Label not found' });
    const existing = existingResult.rows[0];
    const { name, color } = req.body;

    const updatedResult = await query(
      'UPDATE labels SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name !== undefined ? name : existing.name, color !== undefined ? color : existing.color, req.params.id]
    );
    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE label
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM labels WHERE id = $1', [req.params.id]);
    res.json({ message: 'Label deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
