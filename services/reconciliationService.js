const { run, get, all, uuidv4 } = require('../database');

class ReconciliationService {
  // updates: [{ saleId, status }] where status is 'approved' or 'rejected'
  async reconcileSales(updates) {
    const results = [];
    for (const update of updates) {
      const { saleId, status } = update;
      if (!['approved', 'rejected'].includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      // Get sale with user info
      const sale = await get(
        `SELECT s.*, u.balance as user_balance
         FROM sales s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.status = 'pending'`,
        [saleId]
      );
      if (!sale) {
        results.push({ saleId, error: 'Sale not found or not pending' });
        continue;
      }

      let adjustment = 0;
      let txnType = '';
      let amount = 0;

      if (status === 'approved') {
        // Final payout = earning - advance already paid
        const remaining = sale.earning - sale.advance_amount;
        if (remaining > 0) {
          amount = remaining;
          txnType = 'final';
          // Update user balance
          await run(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [amount, sale.user_id]
          );
        }
      } else if (status === 'rejected') {
        if (sale.advance_paid && sale.advance_amount > 0) {
          // Adjustment: negative amount (deduct from balance)
          amount = -sale.advance_amount;
          txnType = 'adjustment';
          await run(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [amount, sale.user_id]  // amount is negative
          );
        }
      }

      // Create transaction record if any amount changed
      if (amount !== 0) {
        const txnId = uuidv4();
        await run(
          `INSERT INTO transactions (id, user_id, sale_id, type, amount, status, completed_at)
           VALUES (?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)`,
          [txnId, sale.user_id, sale.id, txnType, amount]
        );
      }

      // Update sale status
      await run(
        `UPDATE sales SET status = ? WHERE id = ?`,
        [status, saleId]
      );

      results.push({ saleId, status, adjustment: amount });
    }
    return results;
  }
}

module.exports = ReconciliationService;