const API_BASE = 'http://localhost:3000/api';

let currentUserId = 'john_doe';

// DOM refs
const userIdInput = document.getElementById('userId');
const loadUserBtn = document.getElementById('loadUserBtn');
const brandInput = document.getElementById('brand');
const earningInput = document.getElementById('earning');
const createSaleBtn = document.getElementById('createSaleBtn');
const advanceBtn = document.getElementById('advanceBtn');
const pendingSalesList = document.getElementById('pendingSalesList');
const reconcileBtn = document.getElementById('reconcileBtn');
const withdrawAmount = document.getElementById('withdrawAmount');
const withdrawBtn = document.getElementById('withdrawBtn');
const userInfo = document.getElementById('userInfo');
const txnBody = document.getElementById('txnBody');

// Load user data and refresh UI
async function loadUserData(userId) {
  try {
    // Fetch balance
    const balRes = await fetch(`${API_BASE}/users/${userId}/balance`);
    if (!balRes.ok) throw new Error('User not found');
    const user = await balRes.json();
    userInfo.textContent = JSON.stringify(user, null, 2);

    // Fetch transactions
    const txnRes = await fetch(`${API_BASE}/users/${userId}/transactions`);
    const txns = await txnRes.json();
    txnBody.innerHTML = txns.map(t => `
      <tr>
        <td>${t.id.slice(0,8)}</td>
        <td>${t.type}</td>
        <td>${t.amount}</td>
        <td>${t.status}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>
    `).join('');

    // Fetch pending sales for reconciliation
    const salesRes = await fetch(`${API_BASE}/sales/user/${userId}`);
    const sales = await salesRes.json();
    const pending = sales.filter(s => s.status === 'pending');
    pendingSalesList.innerHTML = pending.map(s => `
      <div>
        <input type="checkbox" class="sale-check" data-id="${s.id}" data-earning="${s.earning}" data-advance="${s.advance_amount || 0}">
        <span>Sale ${s.id.slice(0,8)} - Brand: ${s.brand}, Earning: ₹${s.earning}, Advance Paid: ₹${s.advance_amount || 0}</span>
      </div>
    `).join('') || '<p>No pending sales.</p>';
  } catch (err) {
    userInfo.textContent = 'Error: ' + err.message;
  }
}

// Event listeners
loadUserBtn.addEventListener('click', () => {
  currentUserId = userIdInput.value.trim() || 'john_doe';
  loadUserData(currentUserId);
});

// Create sale
createSaleBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim() || 'john_doe';
  const brand = brandInput.value.trim() || 'brand_1';
  const earning = parseFloat(earningInput.value);
  if (isNaN(earning) || earning <= 0) {
    alert('Enter valid earning');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, brand, earning })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    alert(`Sale created: ${data.saleId}`);
    loadUserData(userId);
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// Advance payout
advanceBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim() || 'john_doe';
  try {
    const res = await fetch(`${API_BASE}/payouts/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    alert(`Advance processed: ${data.transactions.length} sale(s) paid.`);
    loadUserData(userId);
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// Reconciliation
reconcileBtn.addEventListener('click', async () => {
  const checks = document.querySelectorAll('.sale-check:checked');
  if (checks.length === 0) {
    alert('Select at least one pending sale to reconcile.');
    return;
  }
  const updates = [];
  checks.forEach(chk => {
    const status = confirm(`Approve sale ${chk.dataset.id.slice(0,8)}? Click OK for Approved, Cancel for Rejected.`);
    updates.push({ saleId: chk.dataset.id, status: status ? 'approved' : 'rejected' });
  });
  try {
    const res = await fetch(`${API_BASE}/sales/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    const data = await res.json();
    alert('Reconciliation completed.');
    loadUserData(currentUserId);
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// Withdrawal
withdrawBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim() || 'john_doe';
  const amount = parseFloat(withdrawAmount.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Enter valid amount');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/withdrawals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount })
    });
    const data = await res.json();
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(`Withdrawal ${data.success ? 'successful' : 'failed (recovered)'}.`);
    }
    loadUserData(userId);
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// Initial load
loadUserData(currentUserId);