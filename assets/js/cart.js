document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingFeeEl = document.getElementById('cart-shipping-fee');
  const totalEl = document.getElementById('cart-total');
  const shippingRadios = document.querySelectorAll('input[name="shipping-source"]');
  const customFields = document.getElementById('custom-shipping-fields');
  const accountPreview = document.getElementById('account-shipping-preview');
  const accountNameEl = document.getElementById('account-ship-name');
  const accountPhoneEl = document.getElementById('account-ship-phone');
  const accountEmailEl = document.getElementById('account-ship-email');
  const accountAddressEl = document.getElementById('account-ship-address');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const reviewCard = document.getElementById('order-review-card');
  const reviewItemsBody = document.getElementById('review-order-items');

  const reviewOrderIdEl = document.getElementById('review-order-id');
  const reviewOrderStatusEl = document.getElementById('review-order-status');
  const reviewOrderPaymentEl = document.getElementById('review-order-payment');
  const reviewOrderAddressEl = document.getElementById('review-order-address');

  const SHIPPING_FEE = 20000;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function formatPrice(value) {
    if (typeof formatCurrency === 'function') return `${formatCurrency(value)}₫`;
    return `${(value || 0).toLocaleString('vi-VN')}₫`;
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCounter === 'function') updateCartCounter();
    if (typeof syncCartToActiveOrder === 'function') syncCartToActiveOrder(cart);
  }

  function renderEmptyState() {
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:40px;">
          Giỏ hàng của bạn đang trống.<br><br>
          <a class="btn primary" href="products.html">Tiếp tục mua sắm</a>
        </td>
      </tr>
    `;
  }

  function renderCart() {
    if (!tbody) return;
    if (!cart.length) {
      renderEmptyState();
      updateSummary();
      return;
    }

    tbody.innerHTML = cart.map(item => {
      const lineTotal = item.price * item.quantity;
      return `
        <tr data-product-id="${item.id}" data-size="${item.size}">
          <td>
            <div class="cart-item">
              <img src="${item.image || ''}" alt="${item.name}">
              <div>
                <div class="product-title">${item.name}</div>
                <div class="muted small">Mã: ${item.id}</div>
              </div>
            </div>
          </td>
          <td>${formatPrice(item.price)}</td>
          <td><span class="badge">${item.size || 'One size'}</span></td>
          <td>
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease">−</button>
              <input type="number" class="cart-qty-input" min="1" max="10" value="${item.quantity}">
              <button class="qty-btn" data-action="increase">+</button>
            </div>
          </td>
          <td class="cart-line-total">${formatPrice(lineTotal)}</td>
          <td>
            <button class="btn ghost small remove-item-btn">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');

    updateSummary();
  }

  function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cart.length ? SHIPPING_FEE : 0;
    const grandTotal = subtotal + shippingFee;

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingFeeEl) shippingFeeEl.textContent = formatPrice(shippingFee);
    if (totalEl) totalEl.textContent = formatPrice(grandTotal);
  }

  function updateCartItemQuantity(row, actionOrValue) {
    const productId = row.dataset.productId;
    const size = row.dataset.size;
    const cartIndex = cart.findIndex(item => item.id === productId && item.size === size);
    if (cartIndex === -1) return;

    if (typeof actionOrValue === 'string') {
      if (actionOrValue === 'increase') cart[cartIndex].quantity = Math.min(10, cart[cartIndex].quantity + 1);
      if (actionOrValue === 'decrease') cart[cartIndex].quantity = Math.max(1, cart[cartIndex].quantity - 1);
    } else {
      const parsed = parseInt(actionOrValue, 10);
      cart[cartIndex].quantity = Math.min(10, Math.max(1, isNaN(parsed) ? 1 : parsed));
    }

    saveCart();
    renderCart();
  }

  function removeCartItem(row) {
    const productId = row.dataset.productId;
    const size = row.dataset.size;
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    renderCart();
  }

  function populateAccountShipping() {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    if (accountNameEl) accountNameEl.textContent = currentUser.name || '—';
    if (accountPhoneEl) accountPhoneEl.textContent = currentUser.phone || 'Chưa cập nhật';
    if (accountEmailEl) accountEmailEl.textContent = currentUser.email || '—';
    if (accountAddressEl) accountAddressEl.textContent = currentUser.address || 'Chưa cập nhật địa chỉ';
  }

  function toggleShippingFields(value) {
    if (!customFields || !accountPreview) return;
    if (value === 'new') {
      customFields.hidden = false;
      accountPreview.hidden = true;
    } else {
      customFields.hidden = true;
      accountPreview.hidden = false;
    }
  }

  function collectShippingInfo(source) {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
    if (source === 'account') {
      if (!currentUser) return null;
      if (!currentUser.address || !currentUser.phone) {
        alert('Vui lòng cập nhật địa chỉ và số điện thoại trong trang Tài khoản trước khi đặt hàng.');
        window.location.href = 'account.html';
        return null;
      }
      return {
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email,
        address: currentUser.address,
        note: ''
      };
    }

    const nameInput = document.getElementById('shipping-name');
    const phoneInput = document.getElementById('shipping-phone');
    const emailInput = document.getElementById('shipping-email');
    const addressInput = document.getElementById('shipping-address');
    const noteInput = document.getElementById('shipping-note');

    if (!nameInput.value.trim() || !phoneInput.value.trim() || !emailInput.value.trim() || !addressInput.value.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên, số điện thoại, email và địa chỉ giao hàng.');
      return null;
    }

    return {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      address: addressInput.value.trim(),
      note: noteInput.value.trim()
    };
  }

  function showOrderReview(order) {
    if (!reviewCard) return;
    if (reviewOrderIdEl) reviewOrderIdEl.textContent = order.orderId;
    if (reviewOrderStatusEl) reviewOrderStatusEl.textContent = ORDER_STATUS_LABELS?.[order.status] || order.status;
    if (reviewOrderPaymentEl) reviewOrderPaymentEl.textContent = PAYMENT_METHOD_LABELS?.[order.paymentMethod] || order.paymentMethod;
    if (reviewOrderAddressEl) reviewOrderAddressEl.textContent = order.shippingInfo?.address || '—';

    if (reviewItemsBody) {
      reviewItemsBody.innerHTML = (order.items || []).map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.size || ''}</td>
          <td>x${item.quantity}</td>
          <td>${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `).join('');
    }
    reviewCard.hidden = false;
  }

  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const row = event.target.closest('tr');
      if (!row) return;
      if (event.target.classList.contains('remove-item-btn')) {
        removeCartItem(row);
      }
      if (event.target.classList.contains('qty-btn')) {
        const action = event.target.dataset.action;
        updateCartItemQuantity(row, action);
      }
    });

    tbody.addEventListener('change', (event) => {
      if (event.target.classList.contains('cart-qty-input')) {
        const row = event.target.closest('tr');
        updateCartItemQuantity(row, event.target.value);
      }
    });
  }

  if (shippingRadios.length) {
    shippingRadios.forEach(radio => {
      radio.addEventListener('change', () => toggleShippingFields(radio.value));
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      const currentUser = typeof requireAuthentication === 'function' ? requireAuthentication() : (typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser')));
      if (!currentUser) return;
      if (!cart.length) {
        alert('Giỏ hàng đang trống.');
        return;
      }

      const shippingSource = document.querySelector('input[name="shipping-source"]:checked')?.value || 'account';
      const paymentMethod = document.querySelector('input[name="cart-payment-method"]:checked')?.value || 'cod';
      const shippingInfo = collectShippingInfo(shippingSource);
      if (!shippingInfo) return;

      const normalizedItems = cart.map(item => ({
        productId: item.id,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity
      }));

      const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const now = new Date().toISOString();

      const orders = typeof getOrders === 'function' ? getOrders() : (JSON.parse(localStorage.getItem('orders')) || []);
      const newOrder = {
        orderId: typeof generateOrderId === 'function' ? generateOrderId() : `DH${Date.now()}`,
        userEmail: currentUser.email,
        customerName: shippingInfo.name || currentUser.name,
        items: normalizedItems,
        total: subtotal + SHIPPING_FEE,
        status: ORDER_STATUS?.PENDING || 'pending',
        paymentStatus: PAYMENT_STATUS?.UNPAID || 'unpaid',
        paymentMethod,
        createdAt: now,
        updatedAt: now,
        shippingInfo,
        shippingFee: SHIPPING_FEE,
        history: [
          { status: 'cart', timestamp: now, note: 'Khách hàng đặt đơn từ giỏ hàng' }
        ]
      };

      orders.push(newOrder);
      if (typeof saveOrders === 'function') saveOrders(orders);
      else localStorage.setItem('orders', JSON.stringify(orders));

      cart = [];
      saveCart();
      renderCart();

      if (reviewItemsBody) reviewItemsBody.innerHTML = '';
      showOrderReview(newOrder);
      alert('Đơn hàng đã được tạo! Bạn có thể theo dõi trong mục Đơn hàng của tôi.');
    });
  }

  populateAccountShipping();
  toggleShippingFields('account');
  renderCart();
});

