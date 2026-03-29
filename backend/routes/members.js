const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all members
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM members ORDER BY full_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
