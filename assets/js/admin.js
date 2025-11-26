// ==========================================================
// ADMIN.JS - CHỈ HIỂN THỊ THÔNG BÁO, KHÔNG THAY ĐỔI DỮ LIỆU
// ==========================================================

// Hàm hiển thị thông báo thành công
function showSuccessMessage(message) {
  // LUÔN HIỂN THỊ THÔNG BÁO BẰNG ALERT ĐỂ ĐẢM BẢO NGƯỜI DÙNG THẤY
  alert(`✓ ${message}`);
  
  // Ngoài ra, cũng tạo thông báo trên màn hình
  const msgEl = document.createElement('div');
  msgEl.className = 'form-success';
  msgEl.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: #e0ffe0; border: 2px solid #a0ffa0; border-radius: 8px; font-weight: 600; color: #2d5a2d; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
  msgEl.textContent = `✓ ${message}`;
  document.body.appendChild(msgEl);
  setTimeout(() => msgEl.remove(), 3000);
}

// Kiểm tra quyền admin
function requireAdmin() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.email !== 'admin@clothify.com') {
    alert('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tư cách Admin.');
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// Load dữ liệu từ localStorage
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Render dữ liệu (chỉ đọc, không sửa)
function renderCustomers() {
  const tbody = document.getElementById('customers-table');
  if (!tbody) return;
  const customers = getData('users').filter(u => u.email !== 'admin@clothify.com');
  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="muted" style="text-align:center;">Chưa có khách hàng.</td></tr>';
    return;
  }
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td>${c.id || 'CUS' + c.email.substring(0, 3)}</td>
      <td>${c.name || 'Khách hàng'}</td>
      <td>${c.email}</td>
      <td>${c.phone || '---'}</td>
      <td>${c.address || '---'}</td>
      <td>${c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : '—'}</td>
      <td><span class="badge ${c.status === 'locked' ? 'badge-danger' : 'badge-success'}">${c.status === 'locked' ? 'Đã khóa' : 'Hoạt động'}</span></td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="reset-password" data-email="${c.email}">Reset MK</button>
        <button class="btn small" data-action="toggle-status" data-email="${c.email}">${c.status === 'locked' ? 'Mở khóa' : 'Khóa'}</button>
      </td>
    </tr>
  `).join('');
}

function renderProductTypes() {
  const tbody = document.getElementById('product-types-table');
  if (!tbody) return;
  const types = getData('productTypes');
  if (!types.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    return;
  }
  tbody.innerHTML = types.map(t => `
    <tr>
      <td>${t.id}</td>
      <td>${t.name}</td>
      <td>${t.profitMargin || 0}%</td>
      <td>${t.description || ''}</td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="edit-type" data-id="${t.id}">Sửa</button>
        <button class="btn small" data-action="delete-type" data-id="${t.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function renderProducts() {
  const tbody = document.getElementById('products-table');
  if (!tbody) return;
  const products = getData('productCatalog');
  const inventory = getData('masterInventory');
  const invMap = {};
  inventory.forEach(item => { invMap[item.id] = item.stock || 0; });
  
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align:center;">Chưa có dữ liệu sản phẩm.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => {
    const stock = invMap[p.id] != null ? invMap[p.id] : '—';
    const statusLabel = p.status === 'hidden' ? 'Đang ẩn' : 'Đang hiển thị';
    const statusClass = p.status === 'hidden' ? 'badge-warning' : 'badge-success';
    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.typeId || '—'}</td>
        <td>${(p.price || 0).toLocaleString('vi-VN')}₫</td>
        <td>${stock}</td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td class="table-actions">
          <button class="btn ghost small" data-action="edit-product" data-id="${p.id}">Sửa</button>
          <button class="btn small" data-action="toggle-product" data-id="${p.id}">${p.status === 'hidden' ? 'Hiển thị' : 'Ẩn'}</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPurchaseOrders() {
  const tbody = document.getElementById('purchase-orders-table');
  if (!tbody) return;
  const orders = getData('purchaseOrders');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;">Chưa có phiếu nhập.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.date ? new Date(o.date).toLocaleDateString('vi-VN') : '—'}</td>
      <td>${o.items?.length || 0}</td>
      <td>${(o.totalCost || 0).toLocaleString('vi-VN')}₫</td>
      <td><span class="badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}">${o.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}</span></td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="edit-purchase" data-id="${o.id}" ${o.status === 'completed' ? 'disabled' : ''}>Sửa</button>
        <button class="btn small" data-action="complete-purchase" data-id="${o.id}" ${o.status === 'completed' ? 'disabled' : ''}>Hoàn thành</button>
        <button class="btn ghost small" data-action="delete-purchase" data-id="${o.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function renderOrders() {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;
  const orders = getData('orders');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align:center;">Chưa có đơn hàng.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const statusLabels = { 'cho-xac-nhan': 'Chờ xác nhận', 'dang-giao': 'Đang giao', 'da-giao': 'Đã giao', 'cancelled': 'Đã hủy' };
    const statusClass = o.status === 'da-giao' ? 'badge-success' : o.status === 'dang-giao' ? 'badge-info' : 'badge-warning';
    return `
      <tr>
        <td>${o.orderId || o.id}</td>
        <td>${o.customerName || o.userEmail || 'Khách'}</td>
        <td>${(o.total || 0).toLocaleString('vi-VN')}₫</td>
        <td>${o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
        <td><span class="badge ${statusClass}">${statusLabels[o.status] || o.status}</span></td>
        <td>
          <select class="admin-status-select" data-order-id="${o.orderId || o.id}">
            <option value="cho-xac-nhan" ${o.status === 'cho-xac-nhan' ? 'selected' : ''}>Chờ xác nhận</option>
            <option value="dang-giao" ${o.status === 'dang-giao' ? 'selected' : ''}>Đang giao</option>
            <option value="da-giao" ${o.status === 'da-giao' ? 'selected' : ''}>Đã giao</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
        <td><button class="btn ghost small" onclick="viewOrderDetail('${o.orderId || o.id}')">Xem</button></td>
      </tr>
    `;
  }).join('');
}

function renderDashboard() {
  const orders = getData('orders');
  const customers = getData('users').filter(u => u.email !== 'admin@clothify.com');
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter(o => o.status === 'cho-xac-nhan');
  const revenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  const revenueEl = document.getElementById('dashboard-revenue');
  const paidCountEl = document.getElementById('dashboard-orders-paid');
  const pendingCountEl = document.getElementById('dashboard-orders-pending');
  const customersEl = document.getElementById('dashboard-customers');
  const ordersTable = document.getElementById('dashboard-orders-table');
  
  if (revenueEl) revenueEl.textContent = revenue.toLocaleString('vi-VN') + '₫';
  if (paidCountEl) paidCountEl.textContent = paidOrders.length;
  if (pendingCountEl) pendingCountEl.textContent = pendingOrders.length;
  if (customersEl) customersEl.textContent = customers.length;
  
  if (ordersTable) {
    if (!orders.length) {
      ordersTable.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      ordersTable.innerHTML = orders.map(o => `
        <tr>
          <td>${o.orderId || o.id}</td>
          <td>${o.customerName || o.userEmail}</td>
          <td>${o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
          <td>${o.status || '—'}</td>
          <td>${(o.total || 0).toLocaleString('vi-VN')}₫</td>
        </tr>
      `).join('');
    }
  }
}

function renderPricingTables() {
  const typeTable = document.getElementById('pricing-type-table');
  const productTable = document.getElementById('pricing-product-table');
  const types = getData('productTypes');
  const products = getData('productCatalog');
  const rules = getData('priceRules');
  
  if (typeTable) {
    if (!types.length) {
      typeTable.innerHTML = '<tr><td colspan="2" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      typeTable.innerHTML = types.map(t => `<tr><td>${t.name}</td><td>${t.profitMargin || 0}%</td></tr>`).join('');
    }
  }
  
  if (productTable) {
    if (!products.length) {
      productTable.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      productTable.innerHTML = products.map(p => {
        const rule = rules.find(r => r.productId === p.id);
        const margin = rule ? rule.profitPercent : 0;
        return `
          <tr>
            <td>${p.name}</td>
            <td>${(p.costPrice || 0).toLocaleString('vi-VN')}₫</td>
            <td>${margin}%</td>
            <td>${(p.price || 0).toLocaleString('vi-VN')}₫</td>
            <td>${p.status === 'hidden' ? 'Ẩn' : 'Áp dụng'}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function renderStockWarnings() {
  const warningContainer = document.getElementById('stock-warning-list');
  if (!warningContainer) return;
  const inventory = getData('masterInventory');
  const lowStock = inventory.filter(item => item.warningLevel != null && item.stock <= item.warningLevel);
  if (!lowStock.length) {
    warningContainer.innerHTML = '<p>Tất cả sản phẩm đều còn đủ hàng.</p>';
  } else {
    warningContainer.innerHTML = lowStock.map(item => `<p>⚠️ <strong>${item.name}</strong> chỉ còn ${item.stock} sản phẩm (ngưỡng ${item.warningLevel}).</p>`).join('');
  }
}

function renderStockHistory() {
  const tbody = document.getElementById('stock-history-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Không có dữ liệu.</td></tr>';
}

function renderFeedback() {
  const container = document.getElementById('feedback-list');
  if (!container) return;
  const feedback = getData('feedback');
  if (!feedback.length) {
    container.innerHTML = '<p class="muted">Chưa có phản hồi nào.</p>';
  } else {
    container.innerHTML = feedback.map(fb => `
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
}

// Xem chi tiết đơn hàng (giữ nguyên)
function viewOrderDetail(orderId) {
  // CHỈ HIỂN THỊ THÔNG BÁO, KHÔNG MỞ MODAL
  showSuccessMessage('Đã xem chi tiết đơn hàng thành công!');
}

// Event Listeners - CHỈ HIỂN THỊ THÔNG BÁO
document.addEventListener('DOMContentLoaded', () => {
  const adminUser = requireAdmin();
  if (!adminUser) return;
  
  // Cập nhật greeting
  const greeting = document.getElementById('admin-greeting');
  if (greeting) greeting.textContent = `Xin chào, ${adminUser.name || 'Admin'}!`;
  
  // Logout
  const logoutBtn = document.getElementById('logout-btn-admin');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }
  
  // Tab switching - KHÔNG HIỂN THỊ THÔNG BÁO (chỉ chuyển tab)
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.toggle('active', p.id === target));
      tab.classList.add('active');
      // BỎ THÔNG BÁO KHI CHUYỂN TAB
    });
  });
  
  // Render dữ liệu
  renderDashboard();
  renderCustomers();
  renderProductTypes();
  renderProducts();
  renderPurchaseOrders();
  renderPricingTables();
  renderOrders();
  renderStockWarnings();
  renderStockHistory();
  renderFeedback();
  
  // ===== KHÁCH HÀNG - CHỈ HIỂN THỊ THÔNG BÁO =====
  // Sử dụng event delegation trên document để bắt tất cả các nút
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    
    const action = btn.dataset.action;
    const table = btn.closest('table');
    if (!table) return;
    
    // Kiểm tra xem nút có thuộc bảng khách hàng không
    if (table.id === 'customers-table' || table.querySelector('#customers-table')) {
      if (action === 'reset-password') {
        e.preventDefault();
        showSuccessMessage('Đã thực hiện reset mật khẩu thành công!');
      } else if (action === 'toggle-status') {
        e.preventDefault();
        showSuccessMessage('Đã thực hiện thay đổi trạng thái khách hàng thành công!');
      }
    }
  });
  
  // Giữ lại event listener cũ để đảm bảo tương thích
  const customersTable = document.getElementById('customers-table');
  if (customersTable) {
    customersTable.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'reset-password') {
        e.preventDefault();
        showSuccessMessage('Đã thực hiện reset mật khẩu thành công!');
      } else if (action === 'toggle-status') {
        e.preventDefault();
        showSuccessMessage('Đã thực hiện thay đổi trạng thái khách hàng thành công!');
      }
    });
  }
  
  // ===== LOẠI SẢN PHẨM - CHỈ HIỂN THỊ THÔNG BÁO =====
  const typesTable = document.getElementById('product-types-table');
  if (typesTable) {
    typesTable.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      e.preventDefault();
      const action = btn.dataset.action;
      if (action === 'edit-type') {
        showSuccessMessage('Đã mở form chỉnh sửa loại sản phẩm!');
      } else if (action === 'delete-type') {
        showSuccessMessage('Đã thực hiện xóa loại sản phẩm thành công!');
      }
    });
  }
  
  const typeForm = document.getElementById('product-type-form');
  if (typeForm) {
    typeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã lưu loại sản phẩm thành công!');
    });
  }
  
  // ===== SẢN PHẨM - CHỈ HIỂN THỊ THÔNG BÁO =====
  const productsTable = document.getElementById('products-table');
  if (productsTable) {
    productsTable.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      e.preventDefault();
      const action = btn.dataset.action;
      if (action === 'edit-product') {
        showSuccessMessage('Đã mở form chỉnh sửa sản phẩm!');
      } else if (action === 'toggle-product') {
        showSuccessMessage('Đã thực hiện thay đổi trạng thái sản phẩm thành công!');
      }
    });
  }
  
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã lưu sản phẩm thành công!');
    });
  }
  
  // ===== PHIẾU NHẬP - CHỈ HIỂN THỊ THÔNG BÁO =====
  const purchaseTable = document.getElementById('purchase-orders-table');
  if (purchaseTable) {
    purchaseTable.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      e.preventDefault();
      const action = btn.dataset.action;
      if (action === 'edit-purchase') {
        showSuccessMessage('Đã mở form chỉnh sửa phiếu nhập!');
      } else if (action === 'complete-purchase') {
        showSuccessMessage('Đã thực hiện hoàn thành phiếu nhập thành công!');
      } else if (action === 'delete-purchase') {
        showSuccessMessage('Đã thực hiện xóa phiếu nhập thành công!');
      }
    });
  }
  
  const purchaseForm = document.getElementById('purchase-order-form');
  if (purchaseForm) {
    purchaseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã lưu phiếu nhập thành công!');
    });
  }
  
  const purchaseFilter = document.getElementById('purchase-filter-form');
  if (purchaseFilter) {
    purchaseFilter.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã thực hiện lọc phiếu nhập thành công!');
    });
  }
  
  // ===== GIÁ BÁN - CHỈ HIỂN THỊ THÔNG BÁO =====
  const typeMarginForm = document.getElementById('type-margin-form');
  if (typeMarginForm) {
    typeMarginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã cập nhật tỷ lệ lợi nhuận theo loại thành công!');
    });
  }
  
  const productMarginForm = document.getElementById('product-margin-form');
  if (productMarginForm) {
    productMarginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã cập nhật lợi nhuận sản phẩm thành công!');
    });
  }
  
  const priceLookupForm = document.getElementById('price-lookup-form');
  if (priceLookupForm) {
    priceLookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã thực hiện tra cứu giá thành công!');
    });
  }
  
  // ===== ĐƠN HÀNG - CHỈ HIỂN THỊ THÔNG BÁO =====
  const ordersTable = document.getElementById('orders-table');
  if (ordersTable) {
    ordersTable.addEventListener('change', (e) => {
      if (e.target.classList.contains('admin-status-select')) {
        showSuccessMessage('Đã cập nhật trạng thái đơn hàng thành công!');
      }
    });
    
    ordersTable.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && (btn.textContent === 'Xem' || btn.onclick)) {
        e.preventDefault();
        // viewOrderDetail sẽ được gọi từ onclick, nhưng chúng ta cũng hiển thị thông báo
        showSuccessMessage('Đã mở chi tiết đơn hàng!');
      }
    });
  }
  
  const orderFilter = document.getElementById('order-filter-form');
  if (orderFilter) {
    orderFilter.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã thực hiện lọc đơn hàng thành công!');
    });
  }
  
  // ===== TỒN KHO - CHỈ HIỂN THỊ THÔNG BÁO =====
  const stockQueryForm = document.getElementById('stock-query-form');
  if (stockQueryForm) {
    stockQueryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã thực hiện xem tồn kho thành công!');
    });
  }
  
  const stockHistoryForm = document.getElementById('stock-history-form');
  if (stockHistoryForm) {
    stockHistoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showSuccessMessage('Đã thực hiện lọc lịch sử tồn kho thành công!');
    });
  }
  
  // ===== PHẢN HỒI - KHÔNG CÓ JS =====
  // Không có event listeners cho phản hồi
  
  // Đóng modal
  const modal = document.getElementById('order-detail-modal');
  const closeBtns = [document.getElementById('close-order-modal'), document.getElementById('close-modal-btn')];
  closeBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  });
  if (modal) {
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
  
  // Export revenue (giữ nguyên)
  const exportBtn = document.getElementById('export-revenue-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const orders = getData('orders');
      const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
      if (!paidOrders.length) {
        alert('Chưa có đơn hàng nào được thanh toán.');
        return;
      }
      showSuccessMessage('Đã xuất báo cáo doanh thu thành công!');
    });
  }
});
