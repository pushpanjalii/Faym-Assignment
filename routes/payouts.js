const express = require('express');
const PayoutService = require('../services/payoutService');
const router = express.Router();
const payoutService = new PayoutService();

router.post('/advance', async (req, res) => {
  try {
    const { userId } = req.body;
    const transactions = await payoutService.processAdvancePayouts(userId);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;