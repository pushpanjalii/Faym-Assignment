````markdown
# 💰 Payout Management System

A full-stack web application for managing affiliate sales payouts with advance payments, reconciliation, withdrawal restrictions, and automatic recovery from failed payouts.

---

## 🚀 Features

- **Create Sales** – Each sale starts with a `pending` status.
- **Advance Payout** – Automatically pays **10%** of earnings for all eligible pending sales (only once per sale).
- **Reconciliation** – Admin can approve or reject sales:
  - ✅ **Approved:** Remaining earnings (`earning - advance`) are credited.
  - ❌ **Rejected:** Any advance already paid is deducted from the user's balance.
- **Withdrawals** – Users can withdraw their balance, limited to **one successful withdrawal every 24 hours**.
- **Failed Payout Recovery** – If a withdrawal fails, the withdrawn amount is automatically restored.
- **Full Audit Trail** – Every financial event is recorded in the transactions table.
- **Clean UI** – Simple single-page interface for demonstration.

---

# 🛠️ Tech Stack

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Frontend
- HTML
- CSS
- Vanilla JavaScript (Fetch API)

### Utilities
- uuid
- cors

---

# 📦 Installation & Setup

## Prerequisites

- Node.js (v14 or above)
- npm

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd payout-system
```

Install dependencies:

```bash
npm install
```

This installs:

- express
- sqlite3
- uuid
- cors

Start the server:

```bash
npm start
```

The server will start at:

```
http://localhost:3000
```

Open your browser and visit:

```
http://localhost:3000
```

The SQLite database (`payout.db`) is automatically created during the first run.

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

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/sales` | Create a new sale (`userId`, `brand`, `earning`) |
| GET | `/sales` | Get all sales |
| GET | `/sales/user/:userId` | Get sales of a specific user |
| POST | `/sales/reconcile` | Reconcile pending sales |
| POST | `/payouts/advance` | Process advance payouts |
| POST | `/withdrawals` | Request withdrawal |
| POST | `/withdrawals/recover/:transactionId` | Recover failed withdrawal |
| GET | `/users/:userId/balance` | Get current balance |
| GET | `/users/:userId/transactions` | Get transaction history |

---

# 🖥️ Demo Walkthrough

### 1. Default User

The application starts with the default user:

```
john_doe
```

You can change it anytime from the input field.

---

### 2. Create Sale

Enter:

- Brand (Example: `brand_1`)
- Earning (Example: `40`)

Click **Create Sale**.

The sale is created with status:

```
pending
```

---

### 3. Process Advance Payout

Click:

```
Process Advance Payout
```

The system:

- Finds all pending sales
- Checks if advance has not already been paid
- Pays **10%** of the earning
- Credits the user's balance
- Marks the sale as `advance_paid`

---

### 4. Reconcile Sales

Select one or more pending sales.

Click:

```
Reconcile Selected
```

Choose either:

### ✅ Approve

The user receives:

```
earning - advance
```

Example:

```
Sale = ₹100

Advance = ₹10

Final Credit = ₹90
```

---

### ❌ Reject

If an advance was already paid:

```
Advance = ₹10

Balance -= ₹10
```

The adjustment is stored as a negative transaction.

---

### 5. Withdraw Funds

Enter an amount.

Click:

```
Request Withdrawal
```

The system validates:

- User has enough balance
- 24-hour withdrawal cooldown has expired

A payout is then simulated.

For demo purposes:

- **70% Success**
- **30% Failure**

---

### Successful Withdrawal

- Balance decreases
- Withdrawal timestamp updated

---

### Failed Withdrawal

The system automatically:

- Credits the withdrawn amount back
- Creates a recovery transaction
- Maintains a complete audit trail

---

### 6. View User Data

The right panel displays:

- Current Balance
- Last Withdrawal Time
- Complete Transaction History

Each transaction includes:

- Type
- Amount
- Status
- Timestamp

---

# 🔄 Business Flow

```
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
Success ───────► Complete

Failure
      │
      ▼
Automatic Recovery
```

---

# 🧪 Edge Cases & Failure Handling

| Scenario | Handling |
|----------|----------|
| Duplicate advance payout | Uses `advance_paid` flag to prevent duplicate credits |
| Reconciling already processed sales | Only `pending` sales are updated |
| Negative balance | Supported; future earnings offset the deficit |
| Concurrent withdrawals | SQLite transactions reduce race conditions (production should use row-level locking) |
| Failed payout | Amount automatically restored through recovery transaction |
| Large batches | Demo processes all records; production should use chunking and pagination |
| Audit trail | Every balance-changing event is recorded |

---

# 🔧 Development & Customization

## Using Another Database

SQLite can easily be replaced with:

- PostgreSQL
- MySQL
- MariaDB

Update the database connection logic inside:

```
database.js
```

---

## Payment Gateway Integration

Currently withdrawals are simulated using:

```javascript
Math.random()
```

Replace the simulation with an actual payment provider such as:

- Stripe
- Razorpay
- PayPal

---

## Authentication

The demo intentionally omits authentication.

For production, consider:

- JWT Authentication
- Session-based Authentication
- OAuth

---

## Testing

No automated test suite is included.

Recommended testing frameworks:

- Jest
- Mocha
- Supertest

Manual testing can be performed using the demo workflow described above.

---

# 📌 Notes

- SQLite database is created automatically on first run.
- All financial events are transactional.
- Every balance update is recorded for traceability.
- Recovery ensures users never permanently lose funds due to payout failures.

---

# 📄 License

This project is intended for educational and demonstration purposes.
````
