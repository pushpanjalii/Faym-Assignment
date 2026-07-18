const express = require('express');
const { get, all } = require('../database');
const router = express.Router();

router.get('/:userId/balance', async (req, res) => {
  try {
    const user = await get(`SELECT id, username, balance, last_withdrawal_at FROM users WHERE id = ?`, [req.params.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/transactions', async (req, res) => {
  try {
    const txns = await all(`SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`, [req.params.userId]);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;