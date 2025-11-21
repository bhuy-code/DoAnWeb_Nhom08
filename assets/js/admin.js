// Chờ DOM tải xong
function requireAdmin() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.email !== 'admin@clothify.com') {
    alert('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tư cách Admin.');
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function normalizeCustomers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  return users
    .filter(user => user.email !== 'admin@clothify.com')
    .map(user => ({
      id: user.id || `CUS${user.email}`,
      name: user.name || 'Khách hàng',
      email: user.email,
      phone: user.phone || '---',
      address: user.address || '---',
      createdAt: user.createdAt || null
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function buildStatusSelect(order) {
  const select = document.createElement('select');
  select.className = 'admin-status-select';
  select.dataset.orderId = order.orderId || order.id;

  const statuses = (typeof ORDER_STATUS !== 'undefined') ? Object.values(ORDER_STATUS) : ['pending', 'shipping', 'delivered', 'cancelled', 'Chờ xác nhận'];
  const labels = (typeof ORDER_STATUS_LABELS !== 'undefined') ? ORDER_STATUS_LABELS : {
    'pending': 'Chờ xử lý', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'Chờ xác nhận': 'Chờ xác nhận'
  };

  statuses.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = labels[status] || status;
    if (order.status === status) option.selected = true;
    select.appendChild(option);
  });

  return select;
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customers-table');
  if (!tbody) return;

  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;">Chưa có khách hàng.</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(customer => `
    <tr>
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone || '---'}</td>
      <td>${customer.address || '---'}</td>
      <td>${customer.createdAt ? new Date(customer.createdAt).toLocaleString('vi-VN') : '—'}</td>
    </tr>
  `).join('');
}

function renderProducts(products, inventory, orders) {
  const tbody = document.getElementById('products-table');
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu sản phẩm.</td></tr>';
    return;
  }

  const soldMap = {};
  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';

  orders
    .filter(order => order.paymentStatus === pStatusPaid)
    .forEach(order => {
      (order.items || []).forEach(item => {
        const pid = item.productId || item.id;
        soldMap[pid] = (soldMap[pid] || 0) + (item.quantity || 0);
      });
    });

  const inventoryMap = {};
  inventory.forEach(item => {
    inventoryMap[item.id] = item.stock || 0;
  });

  tbody.innerHTML = products.map(product => {
    const sold = soldMap[product.id] || 0;
    const stock = inventoryMap[product.id] != null ? inventoryMap[product.id] : '—';
    return `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${typeof formatCurrency === 'function' ? formatCurrency(product.price) : product.price}₫</td>
        <td>${stock}</td>
        <td>${sold}</td>
      </tr>
    `;
  }).join('');
}

// === RENDER BẢNG ĐƠN HÀNG (Tab Đơn hàng) ===
function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align:center;">Chưa có đơn hàng.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  
  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const oStatusPending = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS.PENDING : 'pending';
  const oStatusShipping = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS.SHIPPING : 'shipping';
  const oLabels = (typeof ORDER_STATUS_LABELS !== 'undefined') ? ORDER_STATUS_LABELS : { 'pending': 'Chờ xử lý', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'Chờ xác nhận': 'Chờ xác nhận' };

  orders.forEach(order => {
    const row = document.createElement('tr');
    const orderId = order.orderId || order.id;
    
    row.innerHTML = `
      <td>${orderId}</td>
      <td>${order.customerName || order.userEmail || 'Khách'}</td>
      <td>${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}₫</td>
      <td>${order.paymentStatus === pStatusPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
      <td>
        <span class="badge ${order.status === oStatusPending ? 'badge-warning' : order.status === oStatusShipping ? 'badge-info' : 'badge-success'}">
          ${oLabels[order.status] || order.status}
        </span>
      </td>
      <td class="orders-status-cell"></td>
      <td>
        <button class="btn ghost small" style="padding:4px 8px; font-size:12px;" onclick="viewOrderDetail('${orderId}')">Xem</button>
      </td>
    `;

    const statusCell = row.querySelector('.orders-status-cell');
    const select = buildStatusSelect(order);
    statusCell.appendChild(select);

    tbody.appendChild(row);
  });
}

// === XEM CHI TIẾT ĐƠN HÀNG (MODAL) ===
function viewOrderDetail(orderId) {
  const orders = (typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || []);
  const order = orders.find(o => (o.orderId === orderId || o.id === orderId));

  if (!order) return;

  const modal = document.getElementById('order-detail-modal');
  if (!modal) return;

  const modalId = document.getElementById('modal-order-id');
  const modalName = document.getElementById('modal-customer-name');
  const modalEmail = document.getElementById('modal-customer-email');
  const modalPhone = document.getElementById('modal-customer-phone');
  const modalAddress = document.getElementById('modal-customer-address');
  const modalNote = document.getElementById('modal-customer-note');
  const modalItems = document.getElementById('modal-order-items');

  modalId.innerText = `#${order.orderId || order.id}`;
  modalName.innerText = order.customerName || order.userEmail || 'Khách';
  
  const shipInfo = order.shippingInfo || {};
  modalEmail.innerText = shipInfo.email || order.userEmail || '---';
  modalPhone.innerText = shipInfo.phone || '---';
  modalAddress.innerText = shipInfo.address || '---';
  modalNote.innerText = shipInfo.note || 'Không có ghi chú';
  
  // Hiển thị trạng thái thanh toán
  const modalPaymentStatus = document.getElementById('modal-payment-status');
  if (modalPaymentStatus) {
    const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
    if (order.paymentStatus === pStatusPaid) {
      modalPaymentStatus.textContent = 'Đã thanh toán';
      modalPaymentStatus.className = 'badge badge-success';
    } else {
      modalPaymentStatus.textContent = 'Chưa thanh toán';
      modalPaymentStatus.className = 'badge badge-warning';
    }
  }

  modalItems.innerHTML = '';
  if (!order.items || order.items.length === 0) {
    modalItems.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;" class="muted">Không có sản phẩm trong đơn hàng này.</td></tr>';
  } else {
    (order.items || []).forEach(item => {
      const itemRow = document.createElement('tr');
      const sizeHTML = item.size ? `<div class="small muted">Size: <strong>${item.size}</strong></div>` : '';
      const price = typeof formatCurrency === 'function' ? formatCurrency(item.price || 0) : (item.price || 0);
      const subtotal = typeof formatCurrency === 'function' ? formatCurrency((item.price || 0) * (item.quantity || 0)) : ((item.price || 0) * (item.quantity || 0));
      itemRow.innerHTML = `
        <td style="width: 50px;">
          <img src="${item.image || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid #eee;" onerror="this.style.display='none'">
        </td>
        <td>
          <div style="font-weight:600; font-size:0.9rem;">${item.name}</div>
          ${sizeHTML}
        </td>
        <td style="text-align:center; vertical-align:middle;">x${item.quantity || 0}</td>
        <td style="text-align:right; vertical-align:middle; font-weight:600;">${price}₫</td>
        <td style="text-align:right; vertical-align:middle; font-weight:700; color:#d32f2f;">${subtotal}₫</td>
      `;
      modalItems.appendChild(itemRow);
    });
    
    // Thêm dòng tổng cộng
    const totalRow = document.createElement('tr');
    totalRow.style.borderTop = '2px solid #eee';
    totalRow.style.fontWeight = '700';
    const total = typeof formatCurrency === 'function' ? formatCurrency(order.total || 0) : (order.total || 0);
    totalRow.innerHTML = `
      <td colspan="4" style="text-align:right; padding:12px;">Tổng cộng:</td>
      <td style="text-align:right; padding:12px; color:#d32f2f; font-size:1.1em;">${total}₫</td>
    `;
    modalItems.appendChild(totalRow);
  }

  modal.classList.add('active');
}

// === RENDER DASHBOARD (Trang Tổng quan) ===
function renderDashboard(orders, customers) {
  const revenueEl = document.getElementById('dashboard-revenue');
  const paidCountEl = document.getElementById('dashboard-orders-paid');
  const pendingCountEl = document.getElementById('dashboard-orders-pending');
  const customersEl = document.getElementById('dashboard-customers');
  const ordersTable = document.getElementById('dashboard-orders-table');

  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const oStatusPending = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS.PENDING : 'pending';
  const pmLabels = (typeof PAYMENT_METHOD_LABELS !== 'undefined') ? PAYMENT_METHOD_LABELS : { 'cod': 'Thanh toán khi nhận hàng (COD)', 'qr': 'Chuyển khoản qua QR' };
  const oLabels = (typeof ORDER_STATUS_LABELS !== 'undefined') ? ORDER_STATUS_LABELS : { 'pending': 'Chờ xử lý', 'shipping': 'Đang giao', 'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'Chờ xác nhận': 'Chờ xác nhận' };

  const paidOrders = orders.filter(order => order.paymentStatus === pStatusPaid);
  const pendingOrders = orders.filter(order => order.status === oStatusPending || order.status === 'Chờ xác nhận');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (revenueEl) revenueEl.textContent = `${typeof formatCurrency === 'function' ? formatCurrency(totalRevenue) : totalRevenue}₫`;
  if (paidCountEl) paidCountEl.textContent = paidOrders.length;
  if (pendingCountEl) pendingCountEl.textContent = pendingOrders.length;
  if (customersEl) customersEl.textContent = customers.length;

  if (ordersTable) {
    if (!orders.length) {
      ordersTable.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      // [ĐÃ SỬA]: Xóa bỏ .slice(0, 5) để hiển thị TOÀN BỘ đơn hàng
      ordersTable.innerHTML = orders.map(order => `
        <tr>
          <td>${order.orderId || order.id}</td>
          <td>${order.customerName || order.userEmail}</td>
          <td>${order.paymentStatus === pStatusPaid ? (pmLabels[order.paymentMethod] || order.paymentMethod || 'Đã thanh toán') : 'Chưa thanh toán'}</td>
          <td>${oLabels[order.status] || order.status}</td>
          <td>${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}₫</td>
        </tr>
      `).join('');
    }
  }
}

function renderFeedback(feedback) {
  const container = document.getElementById('feedback-list');
  if (!container) return;

  if (!feedback.length) {
    container.innerHTML = '<p class="muted">Chưa có phản hồi nào.</p>';
    return;
  }

  container.innerHTML = feedback
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .map(fb => `
      <div class="feedback-item">
        <div class="feedback-header">
          <strong>${fb.name}</strong>
          <span class="muted">${fb.date || ''}</span>
        </div>
        <div class="feedback-title">${fb.title || ''}</div>
        <p class="muted"><em>${fb.email || ''}</em></p>
        <p>${fb.message || ''}</p>
      </div>
    `).join('');
}

function exportRevenueReport(orders) {
  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const paidOrders = orders.filter(order => order.paymentStatus === pStatusPaid);
  
  if (!paidOrders.length) {
    alert('Chưa có đơn hàng nào được thanh toán.');
    return;
  }

  const header = ['Mã đơn', 'Khách hàng', 'Email', 'Phương thức', 'Trạng thái', 'Tổng tiền', 'Thanh toán lúc'];
  const rows = paidOrders.map(order => [
    order.orderId || order.id,
    order.customerName || '',
    order.userEmail || '',
    order.paymentMethod || '—',
    order.status,
    typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total,
    order.paidAt ? new Date(order.paidAt).toLocaleString('vi-VN') : ''
  ]);

  const csvContent = [header, ...rows]
    .map(cols => cols.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clothify_revenue_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
  const adminUser = requireAdmin();
  if (!adminUser) return;

  const ctaContainer = document.querySelector('.header .cta');
  if (ctaContainer) {
    ctaContainer.innerHTML = `
      <span style="font-weight:600; margin-right:10px;">Xin chào, ${adminUser.name}!</span>
      <a href="#" class="btn ghost" id="logout-btn-admin">Đăng xuất</a>
    `;
  }

  const logoutBtn = document.getElementById('logout-btn-admin');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });
      tab.classList.add('active');
    });
  });

  const orders = (typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const customers = normalizeCustomers();
  const products = JSON.parse(localStorage.getItem('productCatalog')) || [];
  const inventory = JSON.parse(localStorage.getItem('masterInventory')) || [];
  const feedback = JSON.parse(localStorage.getItem('feedback')) || [];

  renderDashboard(orders, customers);
  renderCustomers(customers);
  renderProducts(products, inventory, orders);
  renderOrdersTable(orders);
  renderFeedback(feedback);

  // Sự kiện thay đổi trạng thái đơn hàng
  const ordersTable = document.getElementById('orders-table');
  if (ordersTable) {
    ordersTable.addEventListener('change', (event) => {
      if (event.target.classList.contains('admin-status-select')) {
        const select = event.target;
        const orderId = select.dataset.orderId;
        const newStatus = select.value;
        const allOrders = typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || [];
        const idx = allOrders.findIndex(order => (order.orderId === orderId || order.id === orderId));
        
        if (idx > -1) {
          const now = new Date().toISOString();
          allOrders[idx].status = newStatus;
          allOrders[idx].updatedAt = now;
          if(typeof saveOrders === 'function') saveOrders(allOrders);
          else localStorage.setItem('orders', JSON.stringify(allOrders));

          renderOrdersTable(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          renderDashboard(allOrders, customers);
        }
      }
    });
  }

  const exportBtn = document.getElementById('export-revenue-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const currentOrders = typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || [];
      exportRevenueReport(currentOrders);
    });
  }

  // XỬ LÝ ĐÓNG MODAL
  const modal = document.getElementById('order-detail-modal');
  const closeBtns = [
      document.getElementById('close-order-modal'),
      document.getElementById('close-modal-btn')
  ];
  closeBtns.forEach(btn => {
      if(btn) btn.addEventListener('click', () => { if(modal) modal.classList.remove('active'); });
  });
  window.addEventListener('click', (e) => {
      if (modal && e.target === modal) modal.classList.remove('active');
  });
});