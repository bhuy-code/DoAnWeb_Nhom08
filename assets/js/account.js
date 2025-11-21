document.addEventListener('DOMContentLoaded', () => {
  const currentUser = typeof requireAuthentication === 'function' ? requireAuthentication() : null;
  if (!currentUser) return;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const storedUser = users.find(user => user.email === currentUser.email) || currentUser;

  const orders = (typeof getOrders === 'function' ? getOrders() : [])
    .filter(order => order.userEmail === currentUser.email);

  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const paidOrders = orders.filter(order => order.paymentStatus === pStatusPaid);
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
  if (totalSpentEl) totalSpentEl.textContent = `${typeof formatCurrency === 'function' ? formatCurrency(totalSpent) : totalSpent}₫`;

  // Điền thông tin vào form cập nhật
  const updateEmailInput = document.getElementById('update-email');
  const updatePhoneInput = document.getElementById('update-phone');
  const updateAddressInput = document.getElementById('update-address');
  
  if (updateEmailInput) updateEmailInput.value = storedUser.email || currentUser.email || '';
  if (updatePhoneInput) updatePhoneInput.value = storedUser.phone || '';
  if (updateAddressInput) updateAddressInput.value = storedUser.address || '';

  // Xử lý form cập nhật thông tin
  const updateForm = document.getElementById('update-info-form');
  const updateSuccess = document.getElementById('update-success');
  
  if (updateForm) {
    updateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newEmail = updateEmailInput.value.trim();
      const newPhone = updatePhoneInput.value.trim();
      const newAddress = updateAddressInput.value.trim();
      
      if (!newEmail) {
        alert('Vui lòng nhập email!');
        return;
      }
      
      // Cập nhật trong localStorage
      const userIndex = users.findIndex(user => user.email === currentUser.email);
      if (userIndex > -1) {
        users[userIndex].email = newEmail;
        users[userIndex].phone = newPhone;
        users[userIndex].address = newAddress;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Cập nhật currentUser
        const updatedUser = { ...currentUser, email: newEmail, phone: newPhone, address: newAddress };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Cập nhật customers
        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customerIndex = customers.findIndex(c => c.email === currentUser.email);
        if (customerIndex > -1) {
          customers[customerIndex].email = newEmail;
          localStorage.setItem('customers', JSON.stringify(customers));
        }
        
        // Hiển thị lại thông tin
        if (emailEl) emailEl.textContent = newEmail;
        if (phoneEl) phoneEl.textContent = newPhone || 'Chưa cập nhật';
        if (addressEl) addressEl.textContent = newAddress || 'Chưa cập nhật';
        
        // Hiển thị thông báo thành công
        if (updateSuccess) {
          updateSuccess.style.display = 'block';
          setTimeout(() => {
            updateSuccess.style.display = 'none';
          }, 3000);
        }
      }
    });
  }
});

