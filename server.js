const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
const salesRoutes = require('./routes/sales');
const payoutRoutes = require('./routes/payouts');
const withdrawalRoutes = require('./routes/withdrawals');
const userRoutes = require('./routes/users');

app.use('/api/sales', salesRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});