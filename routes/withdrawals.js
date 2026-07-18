const express = require('express');
const WithdrawalService = require('../services/withdrawalService');
const router = express.Router();
const withdrawalService = new WithdrawalService();

router.post('/', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const result = await withdrawalService.requestWithdrawal(userId, amount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/recover/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await withdrawalService.recoverFailedWithdrawal(transactionId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;