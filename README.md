# 💰 Payout Management System

A full-stack web application for managing affiliate sales payouts with advance payments, reconciliation, withdrawal restrictions, and automatic recovery from failed payouts.

---

## 🚀 Features

- **Create Sales** – Every new sale is created with a `pending` status.
- **Advance Payout** – Automatically credits **10%** of the earnings for every eligible pending sale. The advance is processed only once per sale.
- **Reconciliation** – Admins can approve or reject pending sales.
  - **Approved:** The remaining amount (`earning - advance`) is credited to the user's balance.
  - **Rejected:** Any advance already paid is recovered by deducting it from the user's balance.
- **Withdrawals** – Users can withdraw available funds, with a restriction of one successful withdrawal every 24 hours.
- **Failed Payout Recovery** – If a withdrawal fails, the deducted amount is automatically restored.
- **Transaction History** – Every balance-changing event is recorded for complete financial traceability.
- **Simple User Interface** – Single-page application for easy demonstration and testing.

---

# 🛠️ Tech Stack

## Backend

- Node.js
- Express.js

## Database

- SQLite

## Frontend

- HTML
- CSS
- Vanilla JavaScript (Fetch API)

## Utilities

- uuid
- cors

---

# 📦 Installation & Setup

## Prerequisites

- Node.js (v14 or later)
- npm

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd payout-system
```

Install the dependencies:

```bash
npm install
```

The project installs the following packages:

- express
- sqlite3
- uuid
- cors

Start the development server:

```bash
npm start
```

The application will be available at:

```
http://localhost:3000
```

Open the above URL in your browser.

The SQLite database (`payout.db`) is automatically created during the first application startup.

---

# 📁 Project Structure

```text
payout-system/
├── package.json
├── server.js
├── database.js
├── services/
│   ├── payoutService.js
│   ├── reconciliationService.js
│   └── withdrawalService.js
├── routes/
│   ├── sales.js
│   ├── payouts.js
│   ├── withdrawals.js
│   └── users.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

---

# 📚 API Endpoints

All API routes are prefixed with `/api`.

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/sales` | Create a new sale (`userId`, `brand`, `earning`) |
| GET | `/sales` | Retrieve all sales |
| GET | `/sales/user/:userId` | Retrieve sales for a specific user |
| POST | `/sales/reconcile` | Reconcile pending sales |
| POST | `/payouts/advance` | Process advance payouts |
| POST | `/withdrawals` | Request a withdrawal |
| POST | `/withdrawals/recover/:transactionId` | Recover a failed withdrawal |
| GET | `/users/:userId/balance` | Retrieve the current user balance |
| GET | `/users/:userId/transactions` | Retrieve the transaction history |

---

# 🖥️ Demo Walkthrough

## 1. Default User

The application starts with a default user:

```
john_doe
```

You can change the active user at any time using the input field.

---

## 2. Create a Sale

Enter:

- Brand (Example: `brand_1`)
- Earning (Example: `40`)

Click **Create Sale**.

A new sale is created with the status:

```
pending
```

---

## 3. Process Advance Payout

Click:

```
Process Advance Payout
```

The application will:

- Find all eligible pending sales.
- Verify that an advance has not already been processed.
- Credit **10%** of the sale earnings.
- Update the user's balance.
- Mark the sale as `advance_paid`.

---

## 4. Reconcile Sales

Select one or more pending sales.

Click:

```
Reconcile Selected
```

Choose one of the following actions.

### ✅ Approve

The remaining amount is credited:

```
earning - advance
```

Example:

```
Sale Amount = ₹100

Advance Paid = ₹10

Final Credit = ₹90
```

---

### ❌ Reject

If an advance has already been paid:

```
Advance Paid = ₹10

Balance -= ₹10
```

The deduction is recorded as a negative transaction to maintain the audit trail.

---

## 5. Withdraw Funds

Enter the withdrawal amount.

Click:

```
Request Withdrawal
```

Before processing, the system verifies:

- The user has sufficient balance.
- The 24-hour withdrawal cooldown has elapsed.

A payout is then simulated.

For demonstration purposes:

- **70% chance of success**
- **30% chance of failure**

### Successful Withdrawal

- User balance is reduced.
- Last successful withdrawal timestamp is updated.

### Failed Withdrawal

The application automatically:

- Restores the withdrawn amount.
- Creates a recovery transaction.
- Preserves a complete audit trail.

---

## 6. View User Information

The right-side panel displays:

- Current Balance
- Last Withdrawal Time
- Complete Transaction History

Each transaction contains:

- Transaction Type
- Amount
- Status
- Timestamp

---

# 🔄 Business Flow

```text
Create Sale
      │
      ▼
Pending Sale
      │
      ▼
Advance Payout (10%)
      │
      ▼
Reconciliation
   │           │
Approved    Rejected
   │           │
Credit      Recover Advance
Remaining   (Negative Adjustment)
      │
      ▼
User Balance
      │
      ▼
Withdrawal Request
      │
      ▼
Success ─────► Completed

Failure
      │
      ▼
Automatic Recovery
```

---

# 🧪 Edge Cases & Failure Handling

| Scenario | Handling |
|----------|----------|
| Duplicate advance payout | Prevented using the `advance_paid` flag |
| Reconciliation of processed sales | Only sales with `pending` status are processed |
| Negative balance | Supported; future earnings offset the deficit |
| Concurrent withdrawals | SQLite transactions reduce race conditions (production systems should use row-level locking) |
| Failed withdrawal | Automatically restored through a recovery transaction |
| Large batches | Demo processes all records; production systems should implement chunking or pagination |
| Audit trail | Every balance-changing operation is permanently recorded |

---

# 🔧 Development & Customization

## Using Another Database

SQLite can easily be replaced with:

- PostgreSQL
- MySQL
- MariaDB

Update the database connection inside:

```
database.js
```

---

## Payment Gateway Integration

Withdrawals are currently simulated using:

```javascript
Math.random()
```

Replace the simulation with an actual payment gateway such as:

- Stripe
- Razorpay
- PayPal

---

## Authentication

Authentication is intentionally omitted from the demo.

For a production deployment, consider implementing:

- JWT Authentication
- Session-based Authentication
- OAuth

---

## Testing

The project does not include an automated test suite.

Recommended testing frameworks include:

- Jest
- Mocha
- Supertest

The application can also be verified manually by following the demo workflow described above.

---

# 📌 Notes

- The SQLite database is automatically created during the first run.
- All financial operations are handled transactionally.
- Every balance modification is recorded for traceability.
- Automatic recovery ensures users never permanently lose funds because of payout failures.

---

# 📄 License

This project is intended for educational and demonstration purposes.
