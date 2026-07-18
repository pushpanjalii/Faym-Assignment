const express = require('express');
const { run, get, all, uuidv4 } = require('../database');
const router = express.Router();

// Create a new sale
router.post('/', async (req, res) => {
  try {
    const { userId, brand, earning } = req.body;
    // Ensure user exists (create if not)
    let user = await get(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (!user) {
      // For demo, auto-create user with zero balance
      await run(`INSERT INTO users (id, username, balance) VALUES (?, ?, 0)`, [userId, userId]);
    }
    const saleId = uuidv4();
    await run(
      `INSERT INTO sales (id, user_id, brand, earning, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [saleId, userId, brand, earning]
    );
    res.status(201).json({ saleId, userId, brand, earning, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales by user
router.get('/user/:userId', async (req, res) => {
  try {
    const sales = await all(`SELECT * FROM sales WHERE user_id = ?`, [req.params.userId]);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await all(`SELECT * FROM sales`);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;