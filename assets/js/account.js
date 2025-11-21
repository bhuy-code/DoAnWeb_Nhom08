document.addEventListener('DOMContentLoaded', () => {
  const currentUser = typeof requireAuthentication === 'function' ? requireAuthentication() : null;
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const storedUser = users.find(user => user.email === currentUser.email) || currentUser;

  const orders = (typeof getOrders === 'function' ? getOrders() : [])
    .filter(order => order.userEmail === currentUser.email);

  const paidOrders = orders.filter(order => order.paymentStatus === PAYMENT_STATUS.PAID);
  const totalSpent = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  const createdEl = document.getElementById('account-created');
  const phoneEl = document.getElementById('account-phone');
  const addressEl = document.getElementById('account-address');
  const avatarEl = document.getElementById('account-avatar');

  if (nameEl) nameEl.textContent = storedUser.name || currentUser.name || 'Khách hàng';
  if (emailEl) emailEl.textContent = storedUser.email || currentUser.email || '--';
  if (createdEl) {
    const createdDate = storedUser.createdAt ? new Date(storedUser.createdAt) : null;
    createdEl.textContent = createdDate ? createdDate.toLocaleString('vi-VN') : 'Chưa cập nhật';
  }
  if (phoneEl) phoneEl.textContent = storedUser.phone || 'Chưa cập nhật';
  if (addressEl) addressEl.textContent = storedUser.address || 'Chưa cập nhật';
  if (avatarEl) avatarEl.textContent = (storedUser.name || '?').charAt(0).toUpperCase();

  const ordersCountEl = document.getElementById('account-orders-count');
  const ordersPaidEl = document.getElementById('account-orders-paid');
  const totalSpentEl = document.getElementById('account-total-spent');

  if (ordersCountEl) ordersCountEl.textContent = orders.length;
  if (ordersPaidEl) ordersPaidEl.textContent = paidOrders.length;
  if (totalSpentEl) totalSpentEl.textContent = `${formatCurrency(totalSpent)}₫`;
});

