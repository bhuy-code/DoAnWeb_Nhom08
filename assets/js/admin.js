function renderPricingTables() {
  const typeTable = document.getElementById('pricing-type-table');
  if (typeTable) {
    if (!productTypesCache.length) {
      typeTable.innerHTML = '<tr><td colspan="2" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      typeTable.innerHTML = productTypesCache.map(type => `
        <tr>
          <td>${type.name}</td>
          <td>${type.profitMargin || 0}%</td>
        </tr>
      `).join('');
    }
  }

  const productTable = document.getElementById('pricing-product-table');
  if (productTable) {
    if (!catalogCache.length) {
      productTable.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    } else {
      productTable.innerHTML = catalogCache.map(product => {
        const type = productTypesCache.find(t => t.id === product.typeId);
        const productRule = priceRulesCache.find(rule => rule.productId === product.id);
        const margin = productRule ? productRule.profitPercent : (type?.profitMargin || 0);
        const suggestedPrice = Math.round((product.costPrice || 0) * (1 + (margin / 100)));
        return `
          <tr>
            <td>${product.name}</td>
            <td>${formatCurrency(product.costPrice || 0)}₫</td>
            <td>${margin}%</td>
            <td>${formatCurrency(suggestedPrice)}₫</td>
            <td>${product.status === 'hidden' ? 'Ẩn' : 'Áp dụng'}</td>
          </tr>
        `;
      }).join('');
    }
  }

  const priceLookupSelect = document.getElementById('price-lookup-product');
  const priceLookupType = document.getElementById('price-lookup-type');
  if (priceLookupSelect && priceLookupType) {
    priceLookupSelect.addEventListener('change', () => {
      const product = catalogCache.find(p => p.id === priceLookupSelect.value);
      if (!product) {
        priceLookupType.value = '';
        return;
      }
      const type = productTypesCache.find(t => t.id === product.typeId);
      priceLookupType.value = type ? type.name : '—';
    });
  }
}

function handleTypeMarginUpdate(event) {
  event.preventDefault();
  const select = document.getElementById('type-margin-select');
  const valueInput = document.getElementById('type-margin-value');
  if (!select || !valueInput) return;
  const typeId = select.value;
  const margin = parseInt(valueInput.value, 10);
  if (!typeId || isNaN(margin)) {
    alert('Vui lòng chọn loại và nhập tỷ lệ hợp lệ.');
    return;
  }
  const idx = productTypesCache.findIndex(type => type.id === typeId);
  if (idx > -1) {
    productTypesCache[idx].profitMargin = margin;
    saveProductTypesData(productTypesCache);
    renderProductTypesTable();
    renderPricingTables();
    alert('Đã cập nhật tỷ lệ lợi nhuận.');
  }
}

function handleProductMarginUpdate(event) {
  event.preventDefault();
  const select = document.getElementById('product-margin-select');
  const valueInput = document.getElementById('product-margin-value');
  const priceInput = document.getElementById('product-sale-price');
  if (!select || !valueInput) return;
  const productId = select.value;
  const margin = parseInt(valueInput.value, 10);
  const salePrice = parseInt(priceInput.value, 10);
  if (!productId || isNaN(margin)) {
    alert('Vui lòng chọn sản phẩm và nhập tỷ lệ hợp lệ.');
    return;
  }
  const existingIdx = priceRulesCache.findIndex(rule => rule.productId === productId);
  if (existingIdx > -1) {
    priceRulesCache[existingIdx].profitPercent = margin;
  } else {
    priceRulesCache.push({ id: `PR${Date.now()}`, productId, profitPercent: margin });
  }
  savePriceRulesData(priceRulesCache);
  const productIdx = catalogCache.findIndex(product => product.id === productId);
  if (productIdx > -1 && !isNaN(salePrice)) {
    catalogCache[productIdx].price = salePrice;
    saveCatalogData(catalogCache);
  }
  renderPricingTables();
  renderProducts(catalogCache, inventoryCache, cachedOrders);
  alert('Đã cập nhật lợi nhuận sản phẩm.');
}

function handlePriceLookup(event) {
  event.preventDefault();
  const select = document.getElementById('price-lookup-product');
  const typeInput = document.getElementById('price-lookup-type');
  const result = document.getElementById('price-lookup-result');
  if (!select || !result) return;
  const product = catalogCache.find(p => p.id === select.value);
  if (!product) {
    result.textContent = 'Chưa chọn sản phẩm.';
    return;
  }
  const type = productTypesCache.find(t => t.id === product.typeId);
  const rule = priceRulesCache.find(r => r.productId === product.id);
  const margin = rule ? rule.profitPercent : (type?.profitMargin || 0);
  const suggestedPrice = Math.round((product.costPrice || 0) * (1 + (margin / 100)));
  if (typeInput) typeInput.value = type ? type.name : '—';
  result.innerHTML = `
    <p><strong>Giá vốn:</strong> ${formatCurrency(product.costPrice || 0)}₫</p>
    <p><strong>Lợi nhuận áp dụng:</strong> ${margin}%</p>
    <p><strong>Giá bán hiện tại:</strong> ${formatCurrency(product.price || 0)}₫</p>
    <p><strong>Giá bán đề xuất:</strong> ${formatCurrency(suggestedPrice)}₫</p>
  `;
}

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
      createdAt: user.createdAt || null,
      status: user.status || 'active'
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

const STORAGE_KEYS = {
  catalog: 'productCatalog',
  productTypes: 'productTypes',
  priceRules: 'priceRules',
  purchaseOrders: 'purchaseOrders',
  inventory: 'masterInventory',
  inventoryLedger: 'inventoryLedger'
};

function getCatalogData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.catalog)) || [];
}

function saveCatalogData(data) {
  localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(data));
}

function getProductTypesData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.productTypes)) || [];
}

function saveProductTypesData(data) {
  localStorage.setItem(STORAGE_KEYS.productTypes, JSON.stringify(data));
}

function getPriceRulesData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.priceRules)) || [];
}

function savePriceRulesData(data) {
  localStorage.setItem(STORAGE_KEYS.priceRules, JSON.stringify(data));
}

function getPurchaseOrdersData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.purchaseOrders)) || [];
}

function savePurchaseOrdersData(data) {
  localStorage.setItem(STORAGE_KEYS.purchaseOrders, JSON.stringify(data));
}

function getInventoryData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory)) || [];
}

function saveInventoryData(data) {
  localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(data));
}

function getInventoryLedgerData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.inventoryLedger)) || [];
}

function saveInventoryLedgerData(data) {
  localStorage.setItem(STORAGE_KEYS.inventoryLedger, JSON.stringify(data));
}

function ensureInventoryRecord(productId, productName) {
  const inventory = getInventoryData();
  let entry = inventory.find(item => item.id === productId);
  if (!entry) {
    entry = { id: productId, name: productName, stock: 0, warningLevel: 10 };
    inventory.push(entry);
    saveInventoryData(inventory);
  }
  return entry;
}

function updateInventoryStock(productId, amount, note, reference) {
  const inventory = getInventoryData();
  const entry = inventory.find(item => item.id === productId);
  if (entry) {
    entry.stock = Math.max(0, (entry.stock || 0) + amount);
    saveInventoryData(inventory);
  }
  if (typeof recordInventoryMovement === 'function') {
    recordInventoryMovement({
      type: amount >= 0 ? 'import' : 'export',
      productId,
      quantity: Math.abs(amount),
      reference,
      note
    });
  }
}

let catalogCache = [];
let productTypesCache = [];
let priceRulesCache = [];
let purchaseOrdersCache = [];
let inventoryCache = [];
let inventoryLedgerCache = [];
let cachedCustomers = [];
let cachedOrders = [];
let currentPurchaseItems = [];

function rebuildDynamicSelects() {
  const productTypeOptions = productTypesCache
    .map(type => `<option value="${type.id}">${type.name}</option>`)
    .join('');

  const typeSelect = document.getElementById('product-type-select');
  if (typeSelect) {
    typeSelect.innerHTML = productTypeOptions;
  }

  const typeMarginSelect = document.getElementById('type-margin-select');
  if (typeMarginSelect) {
    typeMarginSelect.innerHTML = `<option value="">Chọn loại</option>${productTypeOptions}`;
  }

  const productOptions = catalogCache
    .map(product => `<option value="${product.id}">${product.name}</option>`)
    .join('');

  ['purchase-item-product', 'product-margin-select', 'price-lookup-product', 'stock-query-product'].forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      const placeholder = id === 'purchase-item-product' ? '<option value="">Chọn sản phẩm</option>' : '<option value="">Chọn sản phẩm</option>';
      select.innerHTML = `${placeholder}${productOptions}`;
    }
  });
}

function resetCustomerPassword(email) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const idx = users.findIndex(user => user.email === email);
  if (idx === -1) return;
  users[idx].password = '123456';
  localStorage.setItem('users', JSON.stringify(users));
  alert(`Đã đặt lại mật khẩu cho ${email} về mặc định 123456`);
}

function toggleCustomerStatus(email) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const idx = users.findIndex(user => user.email === email);
  if (idx === -1) return null;
  const currentStatus = users[idx].status === 'locked' ? 'locked' : 'active';
  const nextStatus = currentStatus === 'locked' ? 'active' : 'locked';
  users[idx].status = nextStatus;
  localStorage.setItem('users', JSON.stringify(users));

  let customers = JSON.parse(localStorage.getItem('customers')) || [];
  const customerIdx = customers.findIndex(c => c.email === email);
  if (customerIdx > -1) {
    customers[customerIdx].status = nextStatus;
    localStorage.setItem('customers', JSON.stringify(customers));
  }
  return nextStatus;
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
    tbody.innerHTML = '<tr><td colspan="8" class="muted" style="text-align:center;">Chưa có khách hàng.</td></tr>';
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
      <td>
        <span class="badge ${customer.status === 'locked' ? 'badge-danger' : 'badge-success'}">
          ${customer.status === 'locked' ? 'Đã khóa' : 'Hoạt động'}
        </span>
      </td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="reset-password" data-email="${customer.email}">Reset MK</button>
        <button class="btn small" data-action="toggle-status" data-email="${customer.email}">
          ${customer.status === 'locked' ? 'Mở khóa' : 'Khóa'}
        </button>
      </td>
    </tr>
  `).join('');
}

function setupCustomerActions() {
  const tbody = document.getElementById('customers-table');
  if (!tbody) return;
  tbody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const email = button.dataset.email;
    const action = button.dataset.action;
    if (!email || !action) return;

    if (action === 'reset-password') {
      resetCustomerPassword(email);
      return;
    }

    if (action === 'toggle-status') {
      const nextStatus = toggleCustomerStatus(email);
      if (nextStatus) {
        cachedCustomers = normalizeCustomers();
        renderCustomers(cachedCustomers);
      }
    }
  });
}

function populateProductTypeForm(type) {
  const idInput = document.getElementById('product-type-id');
  const nameInput = document.getElementById('product-type-name');
  const marginInput = document.getElementById('product-type-margin');
  const descInput = document.getElementById('product-type-description');
  const title = document.getElementById('type-form-title');
  if (!idInput || !nameInput || !marginInput) return;
  idInput.value = type.id;
  nameInput.value = type.name;
  marginInput.value = type.profitMargin || 0;
  descInput.value = type.description || '';
  if (title) title.textContent = `Chỉnh sửa loại ${type.name}`;
}

function resetProductTypeForm() {
  const form = document.getElementById('product-type-form');
  const idInput = document.getElementById('product-type-id');
  const title = document.getElementById('type-form-title');
  if (form) form.reset();
  if (idInput) idInput.value = '';
  if (title) title.textContent = 'Thêm loại sản phẩm';
}

function handleProductTypeFormSubmit(event) {
  event.preventDefault();
  const idInput = document.getElementById('product-type-id');
  const nameInput = document.getElementById('product-type-name');
  const marginInput = document.getElementById('product-type-margin');
  const descInput = document.getElementById('product-type-description');
  if (!nameInput || !marginInput) return;

  const payload = {
    id: idInput?.value || `PT${Date.now()}`,
    name: nameInput.value.trim(),
    profitMargin: parseInt(marginInput.value, 10) || 0,
    description: descInput?.value.trim() || ''
  };

  if (!payload.name) {
    alert('Vui lòng nhập tên loại sản phẩm.');
    return;
  }

  const idx = productTypesCache.findIndex(type => type.id === payload.id);
  if (idx > -1) {
    productTypesCache[idx] = payload;
  } else {
    productTypesCache.push(payload);
  }

  saveProductTypesData(productTypesCache);
  rebuildDynamicSelects();
  renderProductTypesTable();
  resetProductTypeForm();
  alert('Đã lưu loại sản phẩm.');
}

function renderProductTypesTable() {
  const tbody = document.getElementById('product-types-table');
  if (!tbody) return;
  if (!productTypesCache.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Chưa có dữ liệu.</td></tr>';
    return;
  }
  tbody.innerHTML = productTypesCache.map(type => `
    <tr>
      <td>${type.id}</td>
      <td>${type.name}</td>
      <td>${type.profitMargin || 0}%</td>
      <td>${type.description || ''}</td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="edit-type" data-id="${type.id}">Sửa</button>
        <button class="btn small" data-action="delete-type" data-id="${type.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function setupProductTypeActions() {
  const form = document.getElementById('product-type-form');
  const resetBtn = document.getElementById('reset-type-form');
  const tbody = document.getElementById('product-types-table');
  if (form) form.addEventListener('submit', handleProductTypeFormSubmit);
  if (resetBtn) resetBtn.addEventListener('click', resetProductTypeForm);
  if (!tbody) return;
  tbody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const typeId = button.dataset.id;
    const type = productTypesCache.find(t => t.id === typeId);
    if (button.dataset.action === 'edit-type' && type) {
      populateProductTypeForm(type);
      return;
    }
    if (button.dataset.action === 'delete-type') {
      if (catalogCache.some(product => product.typeId === typeId)) {
        alert('Không thể xóa vì đang có sản phẩm thuộc loại này.');
        return;
      }
      productTypesCache = productTypesCache.filter(t => t.id !== typeId);
      saveProductTypesData(productTypesCache);
      rebuildDynamicSelects();
      renderProductTypesTable();
    }
  });
}


function renderProducts(products, inventory, orders) {
  const tbody = document.getElementById('products-table');
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align:center;">Chưa có dữ liệu sản phẩm.</td></tr>';
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
    const type = productTypesCache.find(type => type.id === product.typeId);
    const statusLabel = product.status === 'hidden' ? 'Đang ẩn' : 'Đang hiển thị';
    const statusClass = product.status === 'hidden' ? 'badge-warning' : 'badge-success';
    return `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${type ? type.name : '—'}</td>
        <td>${typeof formatCurrency === 'function' ? formatCurrency(product.price) : product.price}₫</td>
        <td>${stock}</td>
        <td>${sold}</td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td class="table-actions">
          <button class="btn ghost small" data-action="edit-product" data-id="${product.id}">Sửa</button>
          <button class="btn small" data-action="toggle-product" data-id="${product.id}">
            ${product.status === 'hidden' ? 'Hiển thị' : 'Ẩn'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateProductForm(product) {
  const formTitle = document.getElementById('product-form-title');
  const codeInput = document.getElementById('product-code');
  const nameInput = document.getElementById('product-name');
  const costInput = document.getElementById('product-cost');
  const priceInput = document.getElementById('product-price');
  const imageInput = document.getElementById('product-image');
  const descInput = document.getElementById('product-description');
  const typeSelect = document.getElementById('product-type-select');
  const categorySelect = document.getElementById('product-category-select');
  const statusSelect = document.getElementById('product-status');
  const modeInput = document.getElementById('product-form-mode');

  if (!codeInput || !nameInput) return;
  modeInput.value = 'update';
  codeInput.value = product.id;
  codeInput.disabled = true;
  nameInput.value = product.name || '';
  costInput.value = product.costPrice || 0;
  priceInput.value = product.price || 0;
  imageInput.value = product.image || '';
  descInput.value = product.description || '';
  if (typeSelect) typeSelect.value = product.typeId || '';
  if (categorySelect) categorySelect.value = product.category || 'nam';
  if (statusSelect) statusSelect.value = product.status || 'active';
  if (formTitle) formTitle.textContent = `Chỉnh sửa sản phẩm ${product.id}`;
}

function resetProductForm() {
  const form = document.getElementById('product-form');
  const modeInput = document.getElementById('product-form-mode');
  const codeInput = document.getElementById('product-code');
  const formTitle = document.getElementById('product-form-title');
  if (form) form.reset();
  if (modeInput) modeInput.value = 'create';
  if (codeInput) {
    codeInput.disabled = false;
    codeInput.value = '';
  }
  if (formTitle) formTitle.textContent = 'Thêm sản phẩm';
}

function handleProductFormSubmit(event) {
  event.preventDefault();
  const codeInput = document.getElementById('product-code');
  const nameInput = document.getElementById('product-name');
  const costInput = document.getElementById('product-cost');
  const priceInput = document.getElementById('product-price');
  const imageInput = document.getElementById('product-image');
  const descInput = document.getElementById('product-description');
  const typeSelect = document.getElementById('product-type-select');
  const categorySelect = document.getElementById('product-category-select');
  const statusSelect = document.getElementById('product-status');
  const modeInput = document.getElementById('product-form-mode');

  if (!codeInput || !nameInput) return;
  const id = codeInput.value.trim().toUpperCase();
  if (!id) {
    alert('Vui lòng nhập mã sản phẩm.');
    return;
  }

  const payload = {
    id,
    name: nameInput.value.trim(),
    costPrice: parseInt(costInput.value, 10) || 0,
    price: parseInt(priceInput.value, 10) || 0,
    image: imageInput.value.trim(),
    description: descInput.value.trim(),
    typeId: typeSelect?.value || '',
    category: categorySelect?.value || 'nam',
    status: statusSelect?.value || 'active'
  };

  if (modeInput.value === 'update') {
    const idx = catalogCache.findIndex(item => item.id === id);
    if (idx > -1) {
      catalogCache[idx] = { ...catalogCache[idx], ...payload };
    }
  } else {
    if (catalogCache.some(item => item.id === id)) {
      alert('Mã sản phẩm đã tồn tại.');
      return;
    }
    catalogCache.push(payload);
  }

  saveCatalogData(catalogCache);
  ensureInventoryRecord(payload.id, payload.name);
  inventoryCache = getInventoryData();
  renderProducts(catalogCache, inventoryCache, cachedOrders);
  rebuildDynamicSelects();
  resetProductForm();
  alert('Đã lưu sản phẩm.');
}

function setupProductActions() {
  const tbody = document.getElementById('products-table');
  const form = document.getElementById('product-form');
  const resetBtn = document.getElementById('reset-product-form');
  if (form) form.addEventListener('submit', handleProductFormSubmit);
  if (resetBtn) resetBtn.addEventListener('click', resetProductForm);
  if (!tbody) return;
  tbody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const productId = button.dataset.id;
    const product = catalogCache.find(item => item.id === productId);
    if (!product) return;

    if (button.dataset.action === 'edit-product') {
      populateProductForm(product);
      window.scrollTo({ top: form?.offsetTop || 0, behavior: 'smooth' });
      return;
    }

    if (button.dataset.action === 'toggle-product') {
      product.status = product.status === 'hidden' ? 'active' : 'hidden';
      saveCatalogData(catalogCache);
      renderProducts(catalogCache, inventoryCache, cachedOrders);
      return;
    }
  });
}

function renderPurchaseOrdersTable(orders) {
  const tbody = document.getElementById('purchase-orders-table');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;">Chưa có phiếu nhập.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '—'}</td>
      <td>${order.items?.length || 0}</td>
      <td>${typeof formatCurrency === 'function' ? formatCurrency(order.totalCost || 0) : order.totalCost}₫</td>
      <td>
        <span class="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">
          ${order.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
        </span>
      </td>
      <td class="table-actions">
        <button class="btn ghost small" data-action="edit-purchase" data-id="${order.id}" ${order.status === 'completed' ? 'disabled' : ''}>Sửa</button>
        <button class="btn small" data-action="complete-purchase" data-id="${order.id}" ${order.status === 'completed' ? 'disabled' : ''}>Hoàn thành</button>
        <button class="btn ghost small" data-action="delete-purchase" data-id="${order.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function renderPurchaseItemsPreview() {
  const container = document.getElementById('purchase-items-preview');
  if (!container) return;
  if (!currentPurchaseItems.length) {
    container.innerHTML = '<span>Chưa có sản phẩm nào.</span>';
    return;
  }
  container.innerHTML = currentPurchaseItems.map((item, index) => {
    const product = catalogCache.find(p => p.id === item.productId);
    return `
      <div class="purchase-item-chip" data-index="${index}">
        <span>${product ? product.name : item.productId}</span>
        <small>${item.quantity} x ${formatCurrency(item.costPrice)}₫</small>
        <button type="button" data-index="${index}">&times;</button>
      </div>
    `;
  }).join('');
}

function handleAddPurchaseItem() {
  const select = document.getElementById('purchase-item-product');
  const qtyInput = document.getElementById('purchase-item-qty');
  const costInput = document.getElementById('purchase-item-cost');
  if (!select || !qtyInput || !costInput) return;
  const productId = select.value;
  const quantity = parseInt(qtyInput.value, 10) || 0;
  const costPrice = parseInt(costInput.value, 10) || 0;
  if (!productId || quantity <= 0 || costPrice <= 0) {
    alert('Vui lòng chọn sản phẩm và nhập số lượng/giá hợp lệ.');
    return;
  }
  currentPurchaseItems.push({ productId, quantity, costPrice });
  renderPurchaseItemsPreview();
  qtyInput.value = '';
  costInput.value = '';
}

function resetPurchaseForm() {
  const form = document.getElementById('purchase-order-form');
  const idInput = document.getElementById('purchase-id');
  if (form) form.reset();
  if (idInput) idInput.value = '';
  currentPurchaseItems = [];
  renderPurchaseItemsPreview();
}

function handlePurchaseOrderSubmit(event) {
  event.preventDefault();
  const idInput = document.getElementById('purchase-id');
  const dateInput = document.getElementById('purchase-date');
  const noteInput = document.getElementById('purchase-note');
  if (!dateInput) return;

  if (!currentPurchaseItems.length) {
    alert('Vui lòng thêm ít nhất một sản phẩm vào phiếu nhập.');
    return;
  }

  const totalCost = currentPurchaseItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const payload = {
    id: idInput?.value || `PO${Date.now()}`,
    date: dateInput.value || new Date().toISOString(),
    status: 'draft',
    note: noteInput?.value || '',
    items: [...currentPurchaseItems],
    totalCost
  };

  const idx = purchaseOrdersCache.findIndex(po => po.id === payload.id);
  if (idx > -1) {
    if (purchaseOrdersCache[idx].status === 'completed') {
      alert('Không thể sửa phiếu nhập đã hoàn thành.');
      return;
    }
    payload.status = purchaseOrdersCache[idx].status;
    purchaseOrdersCache[idx] = payload;
  } else {
    purchaseOrdersCache.push(payload);
  }

  savePurchaseOrdersData(purchaseOrdersCache);
  renderPurchaseOrdersTable(purchaseOrdersCache);
  resetPurchaseForm();
  alert('Đã lưu phiếu nhập.');
}

function completePurchaseOrder(id) {
  const idx = purchaseOrdersCache.findIndex(order => order.id === id);
  if (idx === -1) return;
  const order = purchaseOrdersCache[idx];
  if (order.status === 'completed') return;
  order.status = 'completed';
  order.completedAt = new Date().toISOString();
  (order.items || []).forEach(item => {
    updateInventoryStock(item.productId, item.quantity, 'Nhập kho từ phiếu nhập', order.id);
  });
  purchaseOrdersCache[idx] = order;
  savePurchaseOrdersData(purchaseOrdersCache);
  inventoryCache = getInventoryData();
  inventoryLedgerCache = getInventoryLedgerData();
  renderPurchaseOrdersTable(purchaseOrdersCache);
  renderProducts(catalogCache, inventoryCache, cachedOrders);
  renderStockWarnings();
  renderStockHistoryTable();
  alert('Đã cập nhật tồn kho từ phiếu nhập.');
}

function editPurchaseOrder(id) {
  const order = purchaseOrdersCache.find(po => po.id === id);
  if (!order || order.status === 'completed') return;
  const idInput = document.getElementById('purchase-id');
  const dateInput = document.getElementById('purchase-date');
  const noteInput = document.getElementById('purchase-note');
  if (idInput) idInput.value = order.id;
  if (dateInput) dateInput.value = order.date ? order.date.split('T')[0] : '';
  if (noteInput) noteInput.value = order.note || '';
  currentPurchaseItems = order.items ? [...order.items] : [];
  renderPurchaseItemsPreview();
}

function deletePurchaseOrder(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) return;
  purchaseOrdersCache = purchaseOrdersCache.filter(po => po.id !== id);
  savePurchaseOrdersData(purchaseOrdersCache);
  renderPurchaseOrdersTable(purchaseOrdersCache);
}

function applyPurchaseFilter(event) {
  event.preventDefault();
  const fromInput = document.getElementById('purchase-filter-from');
  const toInput = document.getElementById('purchase-filter-to');
  const statusSelect = document.getElementById('purchase-filter-status');
  const fromDate = fromInput?.value ? new Date(fromInput.value) : null;
  const toDate = toInput?.value ? new Date(toInput.value) : null;
  const status = statusSelect?.value || '';
  const filtered = purchaseOrdersCache.filter(order => {
    const orderDate = order.date ? new Date(order.date) : null;
    if (fromDate && orderDate && orderDate < fromDate) return false;
    if (toDate && orderDate && orderDate > toDate) return false;
    if (status && order.status !== status) return false;
    return true;
  });
  renderPurchaseOrdersTable(filtered);
}

function setupPurchaseActions() {
  const addItemBtn = document.getElementById('add-purchase-item-btn');
  const form = document.getElementById('purchase-order-form');
  const resetBtn = document.getElementById('reset-purchase-form');
  const preview = document.getElementById('purchase-items-preview');
  const tbody = document.getElementById('purchase-orders-table');
  const filterForm = document.getElementById('purchase-filter-form');
  const filterResetBtn = document.getElementById('reset-purchase-filter');
  if (addItemBtn) addItemBtn.addEventListener('click', handleAddPurchaseItem);
  if (form) form.addEventListener('submit', handlePurchaseOrderSubmit);
  if (resetBtn) resetBtn.addEventListener('click', resetPurchaseForm);
  if (filterForm) filterForm.addEventListener('submit', applyPurchaseFilter);
  if (filterResetBtn) filterResetBtn.addEventListener('click', () => {
    if (filterForm) filterForm.reset();
    renderPurchaseOrdersTable(purchaseOrdersCache);
  });
  if (preview) {
    preview.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() === 'button') {
        const index = parseInt(event.target.dataset.index, 10);
        currentPurchaseItems.splice(index, 1);
        renderPurchaseItemsPreview();
      }
    });
  }
  if (tbody) {
    tbody.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = button.dataset.id;
      if (button.dataset.action === 'edit-purchase') {
        editPurchaseOrder(id);
        return;
      }
      if (button.dataset.action === 'complete-purchase') {
        completePurchaseOrder(id);
        return;
      }
      if (button.dataset.action === 'delete-purchase') {
        deletePurchaseOrder(id);
      }
    });
  }
}

function setupPricingActions() {
  const typeForm = document.getElementById('type-margin-form');
  const productForm = document.getElementById('product-margin-form');
  const lookupForm = document.getElementById('price-lookup-form');
  if (typeForm) typeForm.addEventListener('submit', handleTypeMarginUpdate);
  if (productForm) productForm.addEventListener('submit', handleProductMarginUpdate);
  if (lookupForm) lookupForm.addEventListener('submit', handlePriceLookup);

  const productSelect = document.getElementById('product-margin-select');
  const valueInput = document.getElementById('product-margin-value');
  const priceInput = document.getElementById('product-sale-price');
  if (productSelect) {
    productSelect.addEventListener('change', () => {
      const product = catalogCache.find(p => p.id === productSelect.value);
      const rule = priceRulesCache.find(r => r.productId === productSelect.value);
      if (valueInput) valueInput.value = rule ? rule.profitPercent : '';
      if (priceInput) priceInput.value = product ? product.price || '' : '';
    });
  }
}

function renderStockWarnings() {
  const warningContainer = document.getElementById('stock-warning-list');
  if (!warningContainer) return;
  const lowStockItems = inventoryCache.filter(item => item.warningLevel != null && item.stock <= item.warningLevel);
  if (!lowStockItems.length) {
    warningContainer.innerHTML = '<p>Tất cả sản phẩm đều còn đủ hàng.</p>';
    return;
  }
  warningContainer.innerHTML = lowStockItems.map(item => `
    <p>⚠️ <strong>${item.name}</strong> chỉ còn ${item.stock} sản phẩm (ngưỡng ${item.warningLevel}).</p>
  `).join('');
}

function calculateInventoryStats(productId) {
  const ledger = inventoryLedgerCache;
  const imported = ledger.filter(entry => entry.productId === productId && entry.type === 'import')
    .reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  const exported = ledger.filter(entry => entry.productId === productId && entry.type === 'export')
    .reduce((sum, entry) => sum + (entry.quantity || 0), 0);
  const inventoryItem = inventoryCache.find(item => item.id === productId);
  return {
    imported,
    exported,
    stock: inventoryItem ? inventoryItem.stock || 0 : 0
  };
}

function handleStockQuery(event) {
  event.preventDefault();
  const select = document.getElementById('stock-query-product');
  const result = document.getElementById('stock-query-result');
  if (!select || !result) return;
  const product = catalogCache.find(p => p.id === select.value);
  if (!product) {
    result.textContent = 'Vui lòng chọn sản phẩm.';
    return;
  }
  const stats = calculateInventoryStats(product.id);
  result.innerHTML = `
    <p><strong>${product.name}</strong></p>
    <p>Đã nhập: ${stats.imported}</p>
    <p>Đã xuất: ${stats.exported}</p>
    <p>Tồn hiện tại: ${stats.stock}</p>
  `;
}

function renderStockHistoryTable(entries) {
  const tbody = document.getElementById('stock-history-table');
  if (!tbody) return;
  const data = entries && entries.length ? entries : inventoryLedgerCache;
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center;">Không có dữ liệu.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(entry => {
    const product = catalogCache.find(p => p.id === entry.productId);
    return `
      <tr>
        <td>${entry.timestamp ? new Date(entry.timestamp).toLocaleString('vi-VN') : '—'}</td>
        <td>${entry.type === 'import' ? 'Nhập' : 'Xuất'}</td>
        <td>${product ? product.name : entry.productId}</td>
        <td>${entry.quantity}</td>
        <td>${entry.reference || ''}</td>
      </tr>
    `;
  }).join('');
}

function handleStockHistory(event) {
  event.preventDefault();
  const fromInput = document.getElementById('stock-history-from');
  const toInput = document.getElementById('stock-history-to');
  const fromDate = fromInput?.value ? new Date(fromInput.value) : null;
  const toDate = toInput?.value ? new Date(toInput.value) : null;
  const filtered = inventoryLedgerCache.filter(entry => {
    const time = entry.timestamp ? new Date(entry.timestamp) : null;
    if (fromDate && time && time < fromDate) return false;
    if (toDate && time && time > toDate) return false;
    return true;
  });
  renderStockHistoryTable(filtered);
}

function setupStockActions() {
  const queryForm = document.getElementById('stock-query-form');
  const historyForm = document.getElementById('stock-history-form');
  if (queryForm) queryForm.addEventListener('submit', handleStockQuery);
  if (historyForm) historyForm.addEventListener('submit', handleStockHistory);
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

function applyOrderFilter(event) {
  event.preventDefault();
  const fromInput = document.getElementById('order-filter-from');
  const toInput = document.getElementById('order-filter-to');
  const statusSelect = document.getElementById('order-filter-status');
  const fromDate = fromInput?.value ? new Date(fromInput.value) : null;
  const toDate = toInput?.value ? new Date(toInput.value) : null;
  const status = statusSelect?.value || '';
  const filtered = cachedOrders.filter(order => {
    const created = order.createdAt ? new Date(order.createdAt) : null;
    if (fromDate && created && created < fromDate) return false;
    if (toDate && created && created > toDate) return false;
    if (status && order.status !== status) return false;
    return true;
  });
  renderOrdersTable(filtered);
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

  cachedOrders = (typeof getOrders === 'function' ? getOrders() : JSON.parse(localStorage.getItem('orders')) || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  cachedCustomers = normalizeCustomers();
  catalogCache = getCatalogData();
  productTypesCache = getProductTypesData();
  priceRulesCache = getPriceRulesData();
  purchaseOrdersCache = getPurchaseOrdersData();
  inventoryCache = getInventoryData();
  inventoryLedgerCache = getInventoryLedgerData();
  const feedback = JSON.parse(localStorage.getItem('feedback')) || [];

  rebuildDynamicSelects();
  renderDashboard(cachedOrders, cachedCustomers);
  renderCustomers(cachedCustomers);
  renderProductTypesTable();
  renderProducts(catalogCache, inventoryCache, cachedOrders);
  renderPurchaseOrdersTable(purchaseOrdersCache);
  renderPurchaseItemsPreview();
  renderPricingTables();
  renderOrdersTable(cachedOrders);
  renderFeedback(feedback);
  renderStockWarnings();
  renderStockHistoryTable();

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

          cachedOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          renderOrdersTable(cachedOrders);
          renderDashboard(cachedOrders, cachedCustomers);
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

  setupCustomerActions();
  setupProductTypeActions();
  setupProductActions();
  setupPurchaseActions();
  setupPricingActions();
  setupStockActions();

  const orderFilterForm = document.getElementById('order-filter-form');
  const resetOrderFilter = document.getElementById('reset-order-filter');
  if (orderFilterForm) orderFilterForm.addEventListener('submit', applyOrderFilter);
  if (resetOrderFilter) {
    resetOrderFilter.addEventListener('click', () => {
      if (orderFilterForm) orderFilterForm.reset();
      renderOrdersTable(cachedOrders);
    });
  }
});