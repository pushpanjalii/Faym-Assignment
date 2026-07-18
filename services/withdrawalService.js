const { run, get, all, uuidv4 } = require('../database');

class WithdrawalService {
  async requestWithdrawal(userId, amount) {
    // Fetch user (with row lock if using transaction; we use serializable for simplicity)
    const user = await get(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (!user) throw new Error('User not found');

    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // 24-hour check
    if (user.last_withdrawal_at) {
      const last = new Date(user.last_withdrawal_at);
      const now = new Date();
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours < 24) {
        throw new Error('Withdrawal allowed only once every 24 hours');
      }
    }

    // Deduct balance (pessimistic: we do it now)
    await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [amount, userId]);

    // Create withdrawal transaction (pending)
    const txnId = uuidv4();
    await run(
      `INSERT INTO transactions (id, user_id, type, amount, status, metadata, created_at)
       VALUES (?, ?, 'withdrawal', ?, 'pending', ?, CURRENT_TIMESTAMP)`,
      [txnId, userId, -amount, JSON.stringify({ initiated_at: new Date().toISOString() })]
    );

    // Simulate external payment processing
    try {
      // In real system, call payment gateway. Here we randomly succeed/fail.
      const success = Math.random() > 0.3; // 70% success for demo
      if (success) {
        // Mark transaction completed
        await run(
          `UPDATE transactions SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [txnId]
        );
        // Update last_withdrawal_at
        await run(
          `UPDATE users SET last_withdrawal_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [userId]
        );
        return { success: true, transactionId: txnId };
      } else {
        // Failed - recover
        await this.recoverFailedWithdrawal(txnId);
        return { success: false, transactionId: txnId, recovered: true };
      }
    } catch (err) {
      // If any error, recover
      await this.recoverFailedWithdrawal(txnId);
      throw err;
    }
  }

  async recoverFailedWithdrawal(transactionId) {
    // Get the failed transaction
    const txn = await get(`SELECT * FROM transactions WHERE id = ?`, [transactionId]);
    if (!txn || txn.status !== 'pending') {
      throw new Error('Transaction not found or already processed');
    }

    // Mark as failed
    await run(
      `UPDATE transactions SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [transactionId]
    );

    // Credit back the amount (absolute value)
    const amount = Math.abs(txn.amount);
    await run(`UPDATE users SET balance = balance + ? WHERE id = ?`, [amount, txn.user_id]);

    // Create recovery transaction
    const recoveryId = uuidv4();
    await run(
      `INSERT INTO transactions (id, user_id, type, amount, status, metadata, completed_at)
       VALUES (?, ?, 'recovery', ?, 'completed', ?, CURRENT_TIMESTAMP)`,
      [recoveryId, txn.user_id, amount, JSON.stringify({ original_transaction_id: txn.id })]
    );

    return { recoveryId, amount };
  }
}

module.exports = WithdrawalService;