// In routes/sales.js, add:
const ReconciliationService = require('../services/reconciliationService');
const reconciliationService = new ReconciliationService();

router.post('/reconcile', async (req, res) => {
  try {
    const { updates } = req.body; // [{ saleId, status }]
    const results = await reconciliationService.reconcileSales(updates);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});