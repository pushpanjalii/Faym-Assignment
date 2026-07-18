const { run, get, all, uuidv4 } = require('../database');

class PayoutService {
  // Process advance for all pending unpaid sales (optionally for a specific user)
  async processAdvancePayouts(userId = null) {
    let sql = `
      SELECT s.*, u.balance as user_balance
      FROM sales s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'pending' AND s.advance_paid = 0
    `;
    const params = [];
    if (userId) {
      sql += ' AND s.user_id = ?';
      params.push(userId);
    }
    const sales = await all(sql, params);
    const transactions = [];

    for (const sale of sales) {
      const advance = sale.earning * 0.10;
      const txnId = uuidv4();

      // Begin transaction (implicitly via run in sequence)
      await run(
        `INSERT INTO transactions (id, user_id, sale_id, type, amount, status, completed_at)
         VALUES (?, ?, ?, 'advance', ?, 'completed', CURRENT_TIMESTAMP)`,
        [txnId, sale.user_id, sale.id, advance]
      );

      // Mark sale as advance_paid
      await run(
        `UPDATE sales SET advance_paid = 1, advance_amount = ? WHERE id = ?`,
        [advance, sale.id]
      );

      // Update user balance
      await run(
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [advance, sale.user_id]
      );

      transactions.push({
        id: txnId,
        userId: sale.user_id,
        saleId: sale.id,
        amount: advance,
        type: 'advance'
      });
    }
    return transactions;
  }
}

module.exports = PayoutService;