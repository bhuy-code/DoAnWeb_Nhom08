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
      createdAt: user.createdAt || null
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function buildStatusSelect(order) {
  const select = document.createElement('select');
  select.className = 'admin-status-select';
  select.dataset.orderId = order.orderId;

  Object.values(ORDER_STATUS).forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = ORDER_STATUS_LABELS[status] || status;
    if (order.status === status) option.selected = true;
    select.appendChild(option);
  });

  return select;
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customers-table');
  if (!tbody) return;

  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center;">Chưa có khách hàng.</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(customer => `
    <tr>
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
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
  orders
    .filter(order => order.paymentStatus === PAYMENT_STATUS.PAID)
    .forEach(order => {
      (order.items || []).forEach(item => {
        soldMap[item.productId] = (soldMap[item.productId] || 0) + (item.quantity || 0);
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
        <td>${formatCurrency(product.price)}₫</td>
        <td>${stock}</td>
        <td>${sold}</td>
      </tr>
    `;
  }).join('');
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;">Chưa có đơn hàng.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  orders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.customerName || order.userEmail}</td>
      <td>${formatCurrency(order.total)}₫</td>
      <td>${order.paymentStatus === PAYMENT_STATUS.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
      <td><span class="badge ${order.status === ORDER_STATUS.PENDING ? 'badge-warning' : order.status === ORDER_STATUS.SHIPPING ? 'badge-info' : 'badge-success'}">${ORDER_STATUS_LABELS[order.status] || order.status}</span></td>
      <td class="orders-status-cell"></td>
    `;

    const statusCell = row.querySelector('.orders-status-cell');
    const select = buildStatusSelect(order);
    statusCell.appendChild(select);

    tbody.appendChild(row);
  });
}

function renderDashboard(orders, customers) {
  const revenueEl = document.getElementById('dashboard-revenue');
  const paidCountEl = document.getElementById('dashboard-orders-paid');
  const pendingCountEl = document.getElementById('dashboard-orders-pending');
  const customersEl = document.getElementById('dashboard-customers');
  const ordersTable = document.getElementById('dashboard-orders-table');

  const paidOrders = orders.filter(order => order.paymentStatus === PAYMENT_STATUS.PAID);
  const pendingOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING);
  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (revenueEl) revenueEl.textContent = `${formatCurrency(totalRevenue)}₫`;
  if (paidCountEl) paidCountEl.textContent = paidOrders.length;
  if (pendingCountEl) pendingCountEl.textContent = pendingOrders.length;
  if (customersEl) customersEl.textContent = customers.length;

  if (ordersTable) {
    if (!orders.length) {
      ordersTable.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      ordersTable.innerHTML = orders.map(order => `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.customerName || order.userEmail}</td>
          <td>${order.paymentStatus === PAYMENT_STATUS.PAID ? (PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || 'Đã thanh toán') : 'Chưa thanh toán'}</td>
          <td>${ORDER_STATUS_LABELS[order.status] || order.status}</td>
          <td>${formatCurrency(order.total)}₫</td>
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
  const paidOrders = orders.filter(order => order.paymentStatus === PAYMENT_STATUS.PAID);
  if (!paidOrders.length) {
    alert('Chưa có đơn hàng nào được thanh toán.');
    return;
  }

  const header = ['Mã đơn', 'Khách hàng', 'Email', 'Phương thức', 'Trạng thái', 'Tổng tiền', 'Thanh toán lúc'];
  const rows = paidOrders.map(order => [
    order.orderId,
    order.customerName || '',
    order.userEmail || '',
    PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || '—',
    ORDER_STATUS_LABELS[order.status] || order.status,
    formatCurrency(order.total),
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
      alert('Đã đăng xuất khỏi tài khoản Admin.');
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

  const orders = (typeof getOrders === 'function' ? getOrders() : [])
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

  const ordersTable = document.getElementById('orders-table');
  if (ordersTable) {
    ordersTable.addEventListener('change', (event) => {
      if (event.target.classList.contains('admin-status-select')) {
        const select = event.target;
        const orderId = select.dataset.orderId;
        const newStatus = select.value;
        const allOrders = getOrders();
        const idx = allOrders.findIndex(order => order.orderId === orderId);
        if (idx > -1) {
          const now = new Date().toISOString();
          allOrders[idx].status = newStatus;
          allOrders[idx].updatedAt = now;
          allOrders[idx].history = [
            ...(allOrders[idx].history || []),
            {
              status: newStatus,
              timestamp: now,
              note: 'Admin cập nhật trạng thái đơn hàng'
            }
          ];
          saveOrders(allOrders);
          renderOrdersTable(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          renderDashboard(allOrders, customers);
        }
      }
    });
  }

  const exportBtn = document.getElementById('export-revenue-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportRevenueReport(getOrders()));
  }
});