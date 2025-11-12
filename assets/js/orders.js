function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

function createStatusBadge(status) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = ORDER_STATUS_LABELS[status] || status;

  if (status === ORDER_STATUS.PENDING) {
    badge.classList.add('badge-warning');
  } else if (status === ORDER_STATUS.SHIPPING) {
    badge.classList.add('badge-info');
  } else if (status === ORDER_STATUS.DELIVERED) {
    badge.classList.add('badge-success');
  }

  return badge;
}

function createPaymentBadge(paymentStatus) {
  const badge = document.createElement('span');
  badge.className = 'badge';

  if (paymentStatus === PAYMENT_STATUS.PAID) {
    badge.classList.add('badge-success');
    badge.textContent = 'Đã thanh toán';
  } else {
    badge.classList.add('badge-warning');
    badge.textContent = 'Chưa thanh toán';
  }

  return badge;
}

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

  orders.forEach(order => {
    const card = document.createElement('article');
    card.className = 'order-card';
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <header class="order-card__header">
        <div>
          <h3>${order.orderId}</h3>
          <span class="muted small">${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div class="order-card__badges"></div>
      </header>
      <div class="order-card__body">
        <div>
          <span class="muted small">Sản phẩm</span>
          <strong>${order.items.length}</strong>
        </div>
        <div>
          <span class="muted small">Tổng tiền</span>
          <strong>${formatCurrency(order.total)}₫</strong>
        </div>
        <div>
          <span class="muted small">Thanh toán</span>
          <strong>${order.paymentMethod ? (PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod) : 'Chưa chọn'}</strong>
        </div>
      </div>
      <footer class="order-card__footer">
        <a href="order-detail.html?orderId=${encodeURIComponent(order.orderId)}" class="btn ghost">Xem chi tiết</a>
      </footer>
    `;

    const badgeContainer = card.querySelector('.order-card__badges');
    badgeContainer.appendChild(createStatusBadge(order.status));
    badgeContainer.appendChild(createPaymentBadge(order.paymentStatus));

    container.appendChild(card);
  });
}

function renderOrderItems(items, container) {
  if (!container) return;
  container.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="order-item-name">
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}" class="order-item__thumb">
          <span>${item.name}</span>
        </div>
      </td>
      <td><span class="badge">${item.size || 'One size'}</span></td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.price)}₫</td>
      <td>${formatCurrency(item.subtotal)}₫</td>
    `;
    container.appendChild(row);
  });
}

function renderOrderDetail(order) {
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
  const paymentNote = document.getElementById('payment-note');

  if (orderIdEl) orderIdEl.textContent = `Đơn hàng #${order.orderId}`;
  if (orderCreatedEl) orderCreatedEl.textContent = `Tạo lúc ${new Date(order.createdAt).toLocaleString('vi-VN')}`;
  if (orderTotalEl) orderTotalEl.textContent = `${formatCurrency(order.total)}₫`;
  if (orderShippingEl) orderShippingEl.textContent = ORDER_STATUS_LABELS[order.status] || order.status;

  if (orderPaymentMethodEl) {
    orderPaymentMethodEl.textContent = order.paymentMethod
      ? (PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod)
      : 'Chưa chọn';
  }

  if (orderPaidAtEl) {
    orderPaidAtEl.textContent = order.paidAt
      ? new Date(order.paidAt).toLocaleString('vi-VN')
      : 'Chưa thanh toán';
  }

  if (orderStatusEl) {
    orderStatusEl.textContent = ORDER_STATUS_LABELS[order.status] || order.status;
    orderStatusEl.className = 'badge';
    if (order.status === ORDER_STATUS.PENDING) orderStatusEl.classList.add('badge-warning');
    if (order.status === ORDER_STATUS.SHIPPING) orderStatusEl.classList.add('badge-info');
    if (order.status === ORDER_STATUS.DELIVERED) orderStatusEl.classList.add('badge-success');
  }

  if (paymentStatusEl) {
    paymentStatusEl.textContent = order.paymentStatus === PAYMENT_STATUS.PAID ? 'Đã thanh toán' : 'Chưa thanh toán';
    paymentStatusEl.className = 'badge payment-badge';
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      paymentStatusEl.classList.add('badge-success');
    } else {
      paymentStatusEl.classList.add('badge-warning');
    }
  }

  renderOrderItems(order.items || [], document.getElementById('order-items'));

  if (paymentSection && paymentForm) {
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      paymentForm.remove();
      if (paymentNote) {
        paymentNote.textContent = order.paymentMethod
          ? `Bạn đã thanh toán bằng ${PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}.`
          : 'Đơn hàng đã được thanh toán.';
      }
    } else {
      setupPaymentHandling(paymentForm, order, paymentNote);
    }
  }
}

function setupPaymentHandling(paymentForm, order, paymentNote) {
  const paymentErrorEl = document.getElementById('payment-error');
  const qrPreview = document.getElementById('qr-preview');

  const toggleQrPreview = (method) => {
    if (!qrPreview) return;
    if (method === 'qr') {
      qrPreview.hidden = false;
    } else {
      qrPreview.hidden = true;
    }
  };

  paymentForm.addEventListener('change', (event) => {
    if (event.target.name === 'payment-method') {
      toggleQrPreview(event.target.value);
    }
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (order.paymentStatus === PAYMENT_STATUS.PAID) return;

    const formData = new FormData(paymentForm);
    const method = formData.get('payment-method');

    if (!method) {
      if (paymentErrorEl) paymentErrorEl.textContent = 'Vui lòng chọn phương thức thanh toán.';
      return;
    }

    if (paymentErrorEl) paymentErrorEl.textContent = '';

    const orders = getOrders();
    const index = orders.findIndex(o => o.orderId === order.orderId);
    if (index === -1) return;

    const paidAt = new Date().toISOString();
    orders[index] = {
      ...orders[index],
      paymentMethod: method,
      paymentStatus: PAYMENT_STATUS.PAID,
      paidAt,
      updatedAt: paidAt,
      history: [
        ...(orders[index].history || []),
        {
          status: 'payment',
          timestamp: paidAt,
          note: method === 'qr' ? 'Khách hàng thanh toán bằng QR' : 'Khách hàng chọn COD'
        }
      ],
      inventoryDeducted: orders[index].inventoryDeducted || false
    };

    if (!orders[index].inventoryDeducted && typeof deductInventoryForOrder === 'function') {
      deductInventoryForOrder(orders[index]);
      orders[index].inventoryDeducted = true;
    }

    saveOrders(orders);

    localStorage.setItem('cart', JSON.stringify([]));
    if (typeof updateCartCounter === 'function') updateCartCounter();
    if (typeof syncCartToActiveOrder === 'function') syncCartToActiveOrder([]);

    if (paymentNote) {
      paymentNote.textContent = `Thanh toán thành công bằng ${PAYMENT_METHOD_LABELS[method] || method}.`;
    }

    renderOrderDetail(orders[index]);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const view = document.body.dataset.ordersView;
  if (!view) return;

  const currentUser = typeof requireAuthentication === 'function' ? requireAuthentication() : null;
  if (!currentUser) return;

  const orders = (typeof getOrders === 'function' ? getOrders() : [])
    .filter(order => order.userEmail === currentUser.email)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (view === 'active') {
    const activeOrders = orders.filter(order => order.status !== ORDER_STATUS.DELIVERED || order.paymentStatus !== PAYMENT_STATUS.PAID);
    renderOrdersList(activeOrders, document.getElementById('orders-list'), 'Bạn chưa có đơn hàng nào. Hãy đặt hàng ngay hôm nay!');
  } else if (view === 'history') {
    renderOrdersList(orders, document.getElementById('orders-list'), 'Chưa có đơn hàng nào trong lịch sử.');
  } else if (view === 'detail') {
    const targetId = getQueryParam('orderId');
    if (!targetId) {
      const detailContainer = document.getElementById('order-detail');
      if (detailContainer) {
        detailContainer.innerHTML = '<p class="muted">Không tìm thấy đơn hàng. <a href="my-orders.html">Quay lại danh sách đơn hàng.</a></p>';
      }
      return;
    }

    const targetOrder = orders.find(order => order.orderId === targetId);
    if (!targetOrder) {
      const detailContainer = document.getElementById('order-detail');
      if (detailContainer) {
        detailContainer.innerHTML = '<p class="muted">Không tìm thấy đơn hàng này. <a href="my-orders.html">Quay lại danh sách đơn hàng.</a></p>';
      }
      return;
    }

    renderOrderDetail(targetOrder);
  }
});

