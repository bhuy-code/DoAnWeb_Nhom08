// Hàm lấy tham số từ URL
function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

// Hàm tạo badge trạng thái đơn hàng
function createStatusBadge(status) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  const labels = (typeof ORDER_STATUS_LABELS !== 'undefined') ? ORDER_STATUS_LABELS : {};
  const constants = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS : { PENDING: 'pending', SHIPPING: 'shipping', DELIVERED: 'delivered' };

  badge.textContent = labels[status] || status;

  if (status === constants.PENDING) badge.classList.add('badge-warning');
  else if (status === constants.SHIPPING) badge.classList.add('badge-info');
  else if (status === constants.DELIVERED) badge.classList.add('badge-success');

  return badge;
}

// Hàm tạo badge trạng thái thanh toán
function createPaymentBadge(paymentStatus) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  const pPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';

  if (paymentStatus === pPaid) {
    badge.classList.add('badge-success');
    badge.textContent = 'Đã thanh toán';
  } else {
    badge.classList.add('badge-warning');
    badge.textContent = 'Chưa thanh toán';
  }
  return badge;
}

// Render danh sách đơn hàng
function renderOrdersList(orders, container, emptyMessage) {
  if (!container) return;
  container.innerHTML = '';

  if (!orders.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state__icon">🛍️</div>
      <p>${emptyMessage}</p>
      <a href="products.html" class="btn primary">Tiếp tục mua sắm</a>
    `;
    container.appendChild(emptyState);
    return;
  }

  const labels = (typeof PAYMENT_METHOD_LABELS !== 'undefined') ? PAYMENT_METHOD_LABELS : {};

  orders.forEach(order => {
    const card = document.createElement('article');
    card.className = 'order-card';
    card.setAttribute('role', 'listitem');
    const orderIdDisplay = order.orderId || order.id;

    card.innerHTML = `
      <header class="order-card__header">
        <div>
          <h3>#${orderIdDisplay}</h3>
          <span class="muted small">${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div class="order-card__badges"></div>
      </header>
      <div class="order-card__body">
        <div><span class="muted small">Sản phẩm</span><strong>${order.items ? order.items.length : 0}</strong></div>
        <div><span class="muted small">Tổng tiền</span><strong>${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}₫</strong></div>
        <div><span class="muted small">Thanh toán</span><strong>${order.paymentMethod ? (labels[order.paymentMethod] || order.paymentMethod) : 'Chưa chọn'}</strong></div>
      </div>
      <footer class="order-card__footer">
        <a href="order-detail.html?id=${order.orderId || order.id}" class="btn ghost">Xem chi tiết</a>
      </footer>
    `;

    const badgeContainer = card.querySelector('.order-card__badges');
    badgeContainer.appendChild(createStatusBadge(order.status));
    badgeContainer.appendChild(createPaymentBadge(order.paymentStatus));
    container.appendChild(card);
  });
}

// Render danh sách sản phẩm
function renderOrderItems(items, container) {
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('tr');
    const price = typeof formatCurrency === 'function' ? formatCurrency(item.price) : item.price;
    const subtotal = typeof formatCurrency === 'function' ? formatCurrency(item.price * item.quantity) : (item.price * item.quantity);
    row.innerHTML = `
      <td class="order-item-name">
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}" class="order-item__thumb">
          <span>${item.name}</span>
        </div>
      </td>
      <td><span class="badge">${item.size || 'One size'}</span></td>
      <td>${item.quantity}</td>
      <td>${price}₫</td>
      <td>${subtotal}₫</td>
    `;
    container.appendChild(row);
  });
}

// Hàm render chi tiết đơn hàng
function renderOrderDetail(order) {
  const pPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const constants = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS : { PENDING: 'pending', SHIPPING: 'shipping', DELIVERED: 'delivered' };
  const oLabels = (typeof ORDER_STATUS_LABELS !== 'undefined') ? ORDER_STATUS_LABELS : {};
  const pmLabels = (typeof PAYMENT_METHOD_LABELS !== 'undefined') ? PAYMENT_METHOD_LABELS : {};

  const orderStatusEl = document.getElementById('order-status');
  const paymentStatusEl = document.getElementById('order-payment-status');
  const orderIdEl = document.getElementById('order-id');
  const orderCreatedEl = document.getElementById('order-created');
  const orderPaymentMethodEl = document.getElementById('order-payment-method');
  const orderShippingEl = document.getElementById('order-shipping-status');
  const orderPaidAtEl = document.getElementById('order-paid-at');
  const orderTotalEl = document.getElementById('order-total');
  const paymentSection = document.getElementById('payment-section');
  const paymentForm = document.getElementById('payment-form');

  if (orderIdEl) orderIdEl.textContent = `Đơn hàng #${order.orderId || order.id}`;
  if (orderCreatedEl) orderCreatedEl.textContent = `Tạo lúc ${new Date(order.createdAt).toLocaleString('vi-VN')}`;
  if (orderTotalEl) orderTotalEl.textContent = `${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}₫`;
  if (orderShippingEl) orderShippingEl.textContent = oLabels[order.status] || order.status;

  if (orderPaymentMethodEl) orderPaymentMethodEl.textContent = order.paymentMethod ? (pmLabels[order.paymentMethod] || order.paymentMethod) : 'Chưa chọn';
  if (orderPaidAtEl) orderPaidAtEl.textContent = order.paidAt ? new Date(order.paidAt).toLocaleString('vi-VN') : 'Chưa thanh toán';

  if (orderStatusEl) {
    orderStatusEl.textContent = oLabels[order.status] || order.status;
    orderStatusEl.className = 'badge';
    if (order.status === constants.PENDING) orderStatusEl.classList.add('badge-warning');
    if (order.status === constants.SHIPPING) orderStatusEl.classList.add('badge-info');
    if (order.status === constants.DELIVERED) orderStatusEl.classList.add('badge-success');
  }

  if (paymentStatusEl) {
    paymentStatusEl.textContent = order.paymentStatus === pPaid ? 'Đã thanh toán' : 'Chưa thanh toán';
    paymentStatusEl.className = 'badge payment-badge';
    if (order.paymentStatus === pPaid) paymentStatusEl.classList.add('badge-success');
    else paymentStatusEl.classList.add('badge-warning');
  }

  renderOrderItems(order.items || [], document.getElementById('order-items'));

  if (paymentSection) {
    if (order.paymentStatus === pPaid) {
      const shipInfo = order.shippingInfo || {};
      paymentSection.innerHTML = `
        <div class="alert success" style="background:#d1fae5; color:#065f46; padding:20px; border-radius:8px; margin-top:20px; border: 1px solid #a7f3d0;">
            <h4 style="margin-top:0; margin-bottom:10px;">✓ Đã đặt hàng thành công!</h4>
            <p style="margin-bottom:5px;"><strong>Phương thức:</strong> ${pmLabels[order.paymentMethod] || order.paymentMethod}</p>
            <hr style="border-top:1px solid #a7f3d0; margin:10px 0;">
            <p style="margin-bottom:5px;"><strong>Thông tin giao hàng:</strong></p>
            <ul style="list-style:none; padding-left:0; margin:0;">
              <li>👤 <strong>Người nhận:</strong> ${order.customerName || order.userEmail}</li>
              <li>📧 <strong>Email:</strong> ${shipInfo.email || '---'}</li>
              <li>📞 <strong>SĐT:</strong> ${shipInfo.phone || '---'}</li>
              <li>📍 <strong>Địa chỉ:</strong> ${shipInfo.address || '---'}</li>
              <li>📝 <strong>Ghi chú:</strong> ${shipInfo.note || 'Không có'}</li>
            </ul>
        </div>
      `;
    } else {
      setupPaymentHandling(paymentForm, order);
    }
  }
}

// Hàm xử lý submit form thanh toán
function setupPaymentHandling(paymentForm, order) {
  if (!paymentForm) return;

  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const paymentErrorEl = document.getElementById('payment-error');
  const qrPreview = document.getElementById('qr-preview');
  const accountAddressPreview = document.getElementById('account-address-preview');
  const customAddressFields = document.getElementById('custom-address-fields');
  const addressFromAccount = document.getElementById('address-from-account');
  const addressCustom = document.getElementById('address-custom');

  // Hiển thị địa chỉ từ tài khoản
  if (accountAddressPreview && currentUser) {
    document.getElementById('preview-email').textContent = currentUser.email || '--';
    document.getElementById('preview-phone').textContent = currentUser.phone || '--';
    document.getElementById('preview-address').textContent = currentUser.address || '--';
  }

  // Chuyển đổi giữa địa chỉ tài khoản và địa chỉ mới
  if (addressFromAccount && addressCustom && customAddressFields && accountAddressPreview) {
    addressFromAccount.addEventListener('change', () => {
      if (addressFromAccount.checked) {
        customAddressFields.style.display = 'none';
        accountAddressPreview.style.display = 'block';
      }
    });
    addressCustom.addEventListener('change', () => {
      if (addressCustom.checked) {
        customAddressFields.style.display = 'block';
        accountAddressPreview.style.display = 'none';
      }
    });
  }

  const toggleQrPreview = (method) => {
    if (!qrPreview) return;
    qrPreview.hidden = (method !== 'qr');
  };

  paymentForm.addEventListener('change', (event) => {
    if (event.target.name === 'payment-method') toggleQrPreview(event.target.value);
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
    if (order.paymentStatus === pStatusPaid) return;

    const formData = new FormData(paymentForm);
    const method = formData.get('payment-method');
    const addressSource = formData.get('address-source') || 'account';

    let emailVal, phoneVal, addrVal;

    if (addressSource === 'account') {
      // Dùng địa chỉ từ tài khoản
      emailVal = currentUser.email || '';
      phoneVal = currentUser.phone || '';
      addrVal = currentUser.address || '';
      
      if (!emailVal || !addrVal) {
        if (paymentErrorEl) paymentErrorEl.textContent = 'Vui lòng cập nhật địa chỉ trong tài khoản hoặc chọn "Nhập địa chỉ mới".';
        return;
      }
    } else {
      // Nhập địa chỉ mới
      const emailInput = document.getElementById('customer-email');
      const phoneInput = document.getElementById('customer-phone');
      const addressInput = document.getElementById('customer-address');
      
      emailVal = emailInput ? emailInput.value.trim() : '';
      phoneVal = phoneInput ? phoneInput.value.trim() : '';
      addrVal = addressInput ? addressInput.value.trim() : '';
      
      if (!emailVal || !phoneVal || !addrVal) {
        if (paymentErrorEl) paymentErrorEl.textContent = 'Vui lòng nhập đầy đủ Email, Số điện thoại và Địa chỉ nhận hàng.';
        return;
      }
    }

    if (!method) {
      if (paymentErrorEl) paymentErrorEl.textContent = 'Vui lòng chọn phương thức thanh toán.';
      return;
    }

    const noteInput = document.getElementById('customer-note');
    const noteVal = noteInput ? noteInput.value.trim() : '';

    // Lưu đơn hàng
    const orders = (typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || []);
    const index = orders.findIndex(o => (o.orderId === order.orderId || o.id === order.id));
    
    if (index === -1) {
        alert("Lỗi: Không tìm thấy đơn hàng.");
        return;
    }

    const paidAt = new Date().toISOString();
    
    orders[index] = {
      ...orders[index],
      paymentMethod: method,
      paymentStatus: pStatusPaid,
      paidAt: paidAt,
      updatedAt: paidAt,
      status: typeof ORDER_STATUS !== 'undefined' ? ORDER_STATUS.PENDING : 'cho-xac-nhan',
      shippingInfo: {
          email: emailVal,
          phone: phoneVal,
          address: addrVal,
          note: noteVal
      }
    };

    // Trừ tồn kho
    if (typeof deductInventoryForOrder === 'function') {
      deductInventoryForOrder(orders[index]);
    }

    if(typeof saveOrders === 'function') saveOrders(orders);
    else localStorage.setItem('orders', JSON.stringify(orders));

    // Xóa giỏ hàng
    localStorage.setItem('cart', JSON.stringify([]));
    if (typeof updateCartCounter === 'function') updateCartCounter();

    // Thông báo thành công
    alert('✓ Đã đặt hàng thành công!');
    
    // Hiển thị lại đơn hàng
    renderOrderDetail(orders[index]);
  });
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
  const view = document.body.dataset.ordersView;
  if (!view) return;

  const currentUser = typeof requireAuthentication === 'function' ? requireAuthentication() : JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
      window.location.href = 'login.html';
      return;
  }

  let orders = (typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || [])
    .filter(order => order.userEmail === currentUser.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (view === 'active') {
      // Đơn hàng hiện tại (chưa giao)
      const activeOrders = orders.filter(o => {
        const pPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
        return o.paymentStatus === pPaid && o.status !== (typeof ORDER_STATUS !== 'undefined' ? ORDER_STATUS.DELIVERED : 'da-giao');
      });
      
      if (activeOrders.length === 0) {
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
          ordersList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
              <div style="font-size: 48px; margin-bottom: 20px;">🛍️</div>
              <h3 style="margin-bottom: 10px;">Bạn chưa có đơn hàng nào</h3>
              <p class="muted" style="margin-bottom: 30px;">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
              <a href="products.html" class="btn primary">Xem sản phẩm</a>
            </div>
          `;
        }
      } else {
        renderOrdersList(activeOrders, document.getElementById('orders-list'), 'Bạn chưa có đơn hàng nào.');
      }
  } else if (view === 'history') {
      // Lịch sử đơn hàng (tất cả)
      renderOrdersList(orders, document.getElementById('orders-list'), 'Bạn chưa có đơn hàng nào.');
  } else if (view === 'detail') {
    const targetId = getQueryParam('id') || getQueryParam('orderId');
    if (!targetId) return;

    const targetOrder = orders.find(order => (order.orderId === targetId || order.id === targetId));
    if (targetOrder) renderOrderDetail(targetOrder);
  }
});