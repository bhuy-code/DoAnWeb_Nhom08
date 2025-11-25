// ==========================================================
// HÀM TOÀN CỤC: Cập nhật chỉ báo số lượng giỏ hàng (Badge)
// ==========================================================
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  
  const counterElement = document.getElementById('cart-counter');
  if (counterElement) {
    if (totalQuantity > 0) {
      counterElement.textContent = totalQuantity;
      counterElement.style.display = 'inline-block'; 
    } else {
      counterElement.style.display = 'none'; 
    }
  }
};

// ==========================================================
// CẤU HÌNH VÀ HÀM TIỆN ÍCH DỮ LIỆU ĐƠN HÀNG
// ==========================================================
const ORDER_STATUS = {
  PENDING: 'cho-xac-nhan',
  SHIPPING: 'dang-giao',
  DELIVERED: 'da-giao'
};

const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid'
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.SHIPPING]: 'Đang giao',
  [ORDER_STATUS.DELIVERED]: 'Đã giao'
};

const PAYMENT_METHOD_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  qr: 'Chuyển khoản qua QR',
  online: 'Thanh toán trực tuyến'
};

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function getOrders() {
  return JSON.parse(localStorage.getItem('orders')) || [];
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function generateOrderId() {
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  return `DH${Date.now()}${randomSuffix}`;
}

function findActiveOrder(orders, userEmail) {
  return orders.find(order => order.userEmail === userEmail && order.paymentStatus === PAYMENT_STATUS.UNPAID);
}

function ensureUserIds() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  let updated = false;

  const normalized = users.map(user => {
    if (!user.id) {
      updated = true;
      return {
        ...user,
        id: `CUS${Date.now()}${Math.floor(Math.random() * 1000)}`,
        createdAt: user.createdAt || new Date().toISOString()
      };
    }
    if (!user.createdAt) {
      updated = true;
      return {
        ...user,
        createdAt: new Date().toISOString()
      };
    }
    return user;
  });

  if (updated) {
    localStorage.setItem('users', JSON.stringify(normalized));
  }

  const customerRecords = normalized
    .filter(user => user.email !== 'admin@clothify.com')
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }));
  localStorage.setItem('customers', JSON.stringify(customerRecords));
}

function initializeProductCatalog() {
  if (!localStorage.getItem('productCatalog')) {
    const catalog = [
      { id: 'SP001', name: 'Áo thun basic Form Nữ', price: 199000, costPrice: 150000, category: 'nu', typeId: 'PT001', status: 'active' },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', price: 249000, costPrice: 180000, category: 'nam', typeId: 'PT001', status: 'active' },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', price: 299000, costPrice: 220000, category: 'nam', typeId: 'PT001', status: 'active' },
      { id: 'SP004', name: 'Áo len nữ', price: 349000, costPrice: 260000, category: 'nu', typeId: 'PT001', status: 'active' },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', price: 399000, costPrice: 300000, category: 'nam', typeId: 'PT001', status: 'active' },
      { id: 'SP006', name: 'Jeans Baggy', price: 449000, costPrice: 320000, category: 'nam', typeId: 'PT002', status: 'active' },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', price: 499000, costPrice: 360000, category: 'nam', typeId: 'PT001', status: 'active' },
      { id: 'SP008', name: 'Jeans Baggy Short', price: 549000, costPrice: 400000, category: 'nam', typeId: 'PT002', status: 'active' },
      { id: 'SP009', name: 'Áo khoác Bomber', price: 599000, costPrice: 450000, category: 'nam', typeId: 'PT003', status: 'active' },
      { id: 'SP010', name: 'Áo khoác chần bông lai', price: 649000, costPrice: 500000, category: 'nam', typeId: 'PT003', status: 'active' },
      { id: 'SP011', name: 'Quần thể thao nữ', price: 699000, costPrice: 510000, category: 'nu', typeId: 'PT002', status: 'active' },
      { id: 'SP012', name: 'Quần thể thao nam dài', price: 749000, costPrice: 540000, category: 'nam', typeId: 'PT002', status: 'active' }
    ];
    localStorage.setItem('productCatalog', JSON.stringify(catalog));
  }
}

function cleanupEmptyOrders(userEmail) {
  const orders = getOrders();
  const filtered = orders.filter(order => !(order.userEmail === userEmail && Array.isArray(order.items) && order.items.length === 0));
  if (filtered.length !== orders.length) {
    saveOrders(filtered);
  }
}

function syncCartToActiveOrder(providedCart) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.email === 'admin@clothify.com') {
    return null;
  }

  const cart = Array.isArray(providedCart) ? providedCart : (JSON.parse(localStorage.getItem('cart')) || []);
  let orders = getOrders();
  let activeOrder = findActiveOrder(orders, currentUser.email);
  const now = new Date().toISOString();

  if (!cart.length) {
    if (activeOrder) {
      activeOrder.items = [];
      activeOrder.total = 0;
      activeOrder.updatedAt = now;
      saveOrders(orders);
      cleanupEmptyOrders(currentUser.email);
    }
    return null;
  }

  const normalizedItems = cart.map(item => ({
    productId: item.id,
    name: item.name,
    size: item.size,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    subtotal: item.price * item.quantity
  }));

  const total = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (!activeOrder) {
    activeOrder = {
      orderId: generateOrderId(),
      userEmail: currentUser.email,
      customerName: currentUser.name,
      items: normalizedItems,
      total,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      paymentMethod: null,
      createdAt: now,
      updatedAt: now,
      paidAt: null,
      history: [
        {
          status: ORDER_STATUS.PENDING,
          timestamp: now,
          note: 'Đơn hàng được tạo từ giỏ hàng'
        }
      ],
      inventoryDeducted: false
    };
    orders.push(activeOrder);
  } else {
    activeOrder.items = normalizedItems;
    activeOrder.total = total;
    activeOrder.updatedAt = now;
  }

  saveOrders(orders);
  return activeOrder;
}

function formatCurrency(value) {
  return (value || 0).toLocaleString('vi-VN');
}

function recordInventoryMovement(entry) {
  const ledger = JSON.parse(localStorage.getItem('inventoryLedger')) || [];
  ledger.push({
    id: entry.id || `IMV${Date.now()}${Math.floor(Math.random() * 1000)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    type: entry.type,
    productId: entry.productId,
    quantity: entry.quantity,
    reference: entry.reference || '',
    note: entry.note || ''
  });
  localStorage.setItem('inventoryLedger', JSON.stringify(ledger));
}

function deductInventoryForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return;

  const inventory = JSON.parse(localStorage.getItem('masterInventory')) || [];
  let changed = false;

  order.items.forEach(item => {
    const inventoryItem = inventory.find(inv => inv.id === item.productId);
    if (inventoryItem) {
      inventoryItem.stock = Math.max(0, (inventoryItem.stock || 0) - (item.quantity || 0));
      changed = true;
      recordInventoryMovement({
        type: 'export',
        productId: item.productId,
        quantity: item.quantity || 0,
        reference: order.orderId || order.id,
        note: 'Trừ kho khi xử lý đơn hàng',
        timestamp: new Date().toISOString()
      });
    }
  });

  if (changed) {
    localStorage.setItem('masterInventory', JSON.stringify(inventory));
  }
}

function setupAccountDropdown(currentUser) {
  const ctaContainer = document.querySelector('.header .cta');
  if (!ctaContainer || !currentUser) return;

  if (currentUser.email === 'admin@clothify.com') {
    ctaContainer.innerHTML = `
      <a href="#" class="btn ghost" id="logout-btn">Đăng xuất</a>
    `;
    ctaContainer.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        alert('Đã đăng xuất khỏi tài khoản Admin.');
        window.location.href = 'login.html';
      }
    });
    return;
  }

  ctaContainer.innerHTML = `
    <div class="account-menu">
      <button class="account-toggle" id="account-toggle" aria-haspopup="true" aria-expanded="false">
        <span class="account-avatar">${currentUser.name?.charAt(0)?.toUpperCase() || 'U'}</span>
        <span class="account-name">Xin chào, ${currentUser.name}!</span>
        <span class="account-caret" aria-hidden="true">▾</span>
      </button>
      <div class="account-dropdown" id="account-dropdown" role="menu">
        <a href="account.html" class="dropdown-item" role="menuitem">Thông tin tài khoản</a>
        <a href="my-orders.html" class="dropdown-item" role="menuitem">Đơn hàng của tôi</a>
        <a href="order-history.html" class="dropdown-item" role="menuitem">Lịch sử đơn hàng</a>
      </div>
    </div>
    <a href="#" class="btn ghost" id="logout-btn">Đăng xuất</a>
  `;

  const toggleBtn = ctaContainer.querySelector('#account-toggle');
  const dropdown = ctaContainer.querySelector('#account-dropdown');

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', (event) => {
      event.preventDefault();
      dropdown.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', dropdown.classList.contains('open') ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!ctaContainer.contains(event.target)) {
        dropdown.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const logoutBtn = ctaContainer.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      alert('Đã đăng xuất.');
      window.location.href = 'index.html';
    });
  }
}

function requireAuthentication() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Vui lòng đăng nhập để tiếp tục.');
    window.location.href = 'login.html';
    return null;
  }
  return currentUser;
}

// ==========================================================
// (MỚI) HÀM KHỞI TẠO CƠ SỞ DỮ LIỆU TỒN KHO
// ==========================================================
function initializeInventory() {
  // Kiểm tra xem kho hàng đã tồn tại trong localStorage chưa
  if (!localStorage.getItem('masterInventory')) {
    
    console.log('Đang khởi tạo cơ sở dữ liệu tồn kho lần đầu...');
    
    // Dữ liệu tồn kho ban đầu
    const initialInventory = [
      { id: 'SP001', name: 'Áo thun basic Form Nữ', stock: 120, warningLevel: 20 },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', stock: 80, warningLevel: 20 },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', stock: 50, warningLevel: 15 },
      { id: 'SP004', name: 'Áo len nữ', stock: 75, warningLevel: 15 },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', stock: 90, warningLevel: 20 },
      { id: 'SP006', name: 'Jeans Baggy', stock: 65, warningLevel: 15 },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', stock: 40, warningLevel: 10 },
      { id: 'SP008', name: 'Jeans Baggy Short', stock: 110, warningLevel: 20 },
      { id: 'SP009', name: 'Áo khoác Bomber', stock: 30, warningLevel: 10 },
      { id: 'SP010', name: 'Áo khoác chần bông lai', stock: 45, warningLevel: 10 },
      { id: 'SP011', name: 'Quần thể thao nữ', stock: 85, warningLevel: 20 },
      { id: 'SP012', name: 'Quần thể thao nam dài', stock: 60, warningLevel: 15 }
    ];
    
    // Lưu vào localStorage
    localStorage.setItem('masterInventory', JSON.stringify(initialInventory));
  }
}

function initializeSampleData() {
  // Chỉ khởi tạo một lần
  if (localStorage.getItem('sampleDataInitialized')) return;
  
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  
  // Tạo 2 khách hàng mẫu
  const sampleCustomers = [
    {
      id: 'CUS002',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      password: '123456',
      phone: '0901234567',
      address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'CUS003',
      name: 'Trần Thị Bình',
      email: 'tranthibinh@email.com',
      password: '123456',
      phone: '0987654321',
      address: '456 Đường XYZ, Phường 2, Quận 3, TP.HCM',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }
  ];
  
  // Thêm khách hàng mẫu nếu chưa có
  sampleCustomers.forEach(sampleCustomer => {
    if (!users.find(u => u.email === sampleCustomer.email)) {
      users.push(sampleCustomer);
    }
  });
  localStorage.setItem('users', JSON.stringify(users));
  
  // Cập nhật customers
  let customers = JSON.parse(localStorage.getItem('customers')) || [];
  sampleCustomers.forEach(sampleCustomer => {
    if (!customers.find(c => c.email === sampleCustomer.email)) {
      customers.push({
        id: sampleCustomer.id,
        name: sampleCustomer.name,
        email: sampleCustomer.email,
        createdAt: sampleCustomer.createdAt,
        status: sampleCustomer.status || 'active'
      });
    }
  });
  localStorage.setItem('customers', JSON.stringify(customers));
  
  // Tạo đơn hàng mẫu
  const pStatusPaid = (typeof PAYMENT_STATUS !== 'undefined') ? PAYMENT_STATUS.PAID : 'paid';
  const oStatusDelivered = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS.DELIVERED : 'delivered';
  const oStatusShipping = (typeof ORDER_STATUS !== 'undefined') ? ORDER_STATUS.SHIPPING : 'shipping';
  
  const sampleOrders = [
    {
      orderId: 'DH1704067200001',
      userEmail: 'nguyenvanan@email.com',
      customerName: 'Nguyễn Văn An',
      items: [
        {
          productId: 'SP001',
          name: 'Áo thun basic Form Nữ màu cổ điển',
          size: 'M',
          price: 199000,
          quantity: 2,
          image: 'https://product.hstatic.net/1000184601/product/women_nau-nhat__2__47206564af004145addea15a2b71c162_2048x2048.jpg',
          subtotal: 398000
        },
        {
          productId: 'SP005',
          name: 'Áo sơ mi Nam vải Broadcloth',
          size: 'L',
          price: 399000,
          quantity: 1,
          image: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315862849_org.jpg',
          subtotal: 399000
        }
      ],
      total: 797000,
      status: oStatusDelivered,
      paymentStatus: pStatusPaid,
      paymentMethod: 'cod',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'nguyenvanan@email.com',
        phone: '0901234567',
        address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
        note: 'Giao hàng giờ hành chính'
      },
      inventoryDeducted: true
    },
    {
      orderId: 'DH1704153600002',
      userEmail: 'tranthibinh@email.com',
      customerName: 'Trần Thị Bình',
      items: [
        {
          productId: 'SP003',
          name: 'Áo Sweaeter nỉ',
          size: 'M',
          price: 299000,
          quantity: 1,
          image: 'https://im.uniqlo.com/global-cms/spa/res9d7c31ab934101f35172e2a6d1ae6c3dfr.jpg',
          subtotal: 299000
        },
        {
          productId: 'SP011',
          name: 'Quần thể thao nữ',
          size: 'S',
          price: 699000,
          quantity: 1,
          image: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/d798d656cac14a67a1153cd486f26ce1_9366/quan-short-2-trong-1-climacool-own-the-run.jpg',
          subtotal: 699000
        }
      ],
      total: 998000,
      status: oStatusShipping,
      paymentStatus: pStatusPaid,
      paymentMethod: 'qr',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'tranthibinh@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Phường 2, Quận 3, TP.HCM',
        note: ''
      },
      inventoryDeducted: true
    }
  ];
  
  // Thêm đơn hàng mẫu nếu chưa có
  sampleOrders.forEach(sampleOrder => {
    if (!orders.find(o => o.orderId === sampleOrder.orderId)) {
      orders.push(sampleOrder);
    }
  });
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Đánh dấu đã khởi tạo
  localStorage.setItem('sampleDataInitialized', 'true');
}

// Chờ cho toàn bộ nội dung trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {

  console.log('Clothify JS (script.js) đã sẵn sàng!');
  
  // ==========================================================
  // TÍNH NĂNG 0 (MỚI): KHỞI TẠO KHO
  // ==========================================================
  initializeInventory(); // Chạy hàm khởi tạo kho
  initializeProductCatalog();
  ensureUserIds();
  
  // ==========================================================
  // TÍNH NĂNG 0.5: KHỞI TẠO DỮ LIỆU MẪU (Khách hàng & Đơn hàng)
  // ==========================================================
  initializeSampleData();
  
  // Gọi hàm này ngay khi tải trang để lấy số lượng mới nhất
  updateCartCounter();
  syncCartToActiveOrder();

  // ==========================================================
  // TÍNH NĂNG 2: Lọc sản phẩm (trang "products.html")
  // ==========================================================
  const filterBar = document.querySelector('.filterbar');
  // ==========================================================
  // TÍNH NĂNG 2 (NÂNG CẤP): LỌC SẢN PHẨM + PHÂN TRANG
  // ==========================================================
  
  const allCards = document.querySelectorAll('.grid .card');
  const paginationContainer = document.getElementById('pagination');
  const filterButtons = document.querySelectorAll('.filterbar .badge');
  const advancedCategorySelect = document.getElementById('advanced-category');
  const advancedForm = document.getElementById('advanced-search-form');
  const advancedResetBtn = document.getElementById('reset-advanced-search');

  let currentFilter = 'tatca';
  let currentPage = 1;
  let advancedKeyword = '';
  let advancedMinPrice = null;
  let advancedMaxPrice = null;

  function setActiveFilterBadge(value) {
    const targetValue = value || 'tatca';
    filterButtons.forEach(badge => {
      const badgeValue = badge.getAttribute('data-filler');
      badge.classList.toggle('active', badgeValue === targetValue);
    });
    if (advancedCategorySelect) {
      advancedCategorySelect.value = targetValue === 'tatca' ? '' : targetValue;
    }
  }

  // Chỉ chạy nếu có sản phẩm và khung phân trang
  if (allCards.length > 0 && paginationContainer) {

    // 1. Cấu hình số lượng: Trang chủ 6, Trang sản phẩm 8
    let itemsPerPage = 4; 
    if (window.location.pathname.includes('products.html')) {
      itemsPerPage = 8;
    }

    // Biến lưu trạng thái
    // --- HÀM XỬ LÝ CHÍNH ---
    function updateDisplay() {
      const visibleItems = []; 

      // B1: Lọc sản phẩm
      allCards.forEach(card => {
        const category = card.dataset.category; 
        const title = card.querySelector('.product-name')?.innerText.toLowerCase() || '';
        const desc = card.querySelector('.muted')?.innerText.toLowerCase() || '';
        const priceEl = card.querySelector('.product-price');
        const priceValue = parseInt(priceEl?.getAttribute('data-price-value') || priceEl?.dataset?.priceValue || '0', 10);

        const matchesCategory = currentFilter === 'tatca' || currentFilter === 'all' || category === currentFilter;
        const matchesKeyword = !advancedKeyword || title.includes(advancedKeyword) || desc.includes(advancedKeyword);
        const matchesMin = advancedMinPrice === null || priceValue >= advancedMinPrice;
        const matchesMax = advancedMaxPrice === null || priceValue <= advancedMaxPrice;

        if (matchesCategory && matchesKeyword && matchesMin && matchesMax) {
          visibleItems.push(card);
        } else {
          card.style.display = 'none'; // Ẩn ngay nếu không đúng loại
        }
      });

      // B2: Tính toán phân trang trên danh sách ĐÃ LỌC
      const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
      if (currentPage > totalPages) currentPage = 1;
      if (totalPages === 0) currentPage = 1;

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      // B3: Cắt trang (Chỉ hiện những sp trong khoảng start -> end)
      visibleItems.forEach((card, index) => {
        if (index >= start && index < end) {
          card.style.display = 'flex'; // Hiện
        } else {
          card.style.display = 'none'; // Ẩn (do nằm ở trang khác)
        }
      });

      // B4: Vẽ nút phân trang
      renderPaginationButtons(totalPages);
    }

    // --- HÀM VẼ NÚT 1, 2, 3... ---
    function renderPaginationButtons(totalPages) {
      paginationContainer.innerHTML = '';

      if (totalPages <= 1) return; // Ít sp quá thì khỏi hiện nút

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = 'page-btn'; // Class CSS bạn đã thêm
        if (i === currentPage) btn.classList.add('active');

        btn.addEventListener('click', () => {
          currentPage = i;
          updateDisplay(); // Vẽ lại
          
          // Cuộn lên đầu danh sách
          const grid = document.querySelector('.grid');
          if(grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        paginationContainer.appendChild(btn);
      }
    }

    // --- SỰ KIỆN CLICK NÚT LỌC ---
    if (filterButtons.length > 0) {
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Lấy giá trị lọc và reset về trang 1
          currentFilter = btn.getAttribute('data-filler');
          setActiveFilterBadge(currentFilter);
          currentPage = 1;

          updateDisplay();
        });
      });
    }

    if (advancedForm) {
      advancedForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const keywordInput = advancedForm.querySelector('input[name="keyword"]');
        const priceMinInput = advancedForm.querySelector('input[name="priceMin"]');
        const priceMaxInput = advancedForm.querySelector('input[name="priceMax"]');
        const categoryInput = advancedForm.querySelector('select[name="category"]');

        advancedKeyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        const minValue = priceMinInput?.value ? parseInt(priceMinInput.value, 10) : null;
        const maxValue = priceMaxInput?.value ? parseInt(priceMaxInput.value, 10) : null;

        advancedMinPrice = Number.isFinite(minValue) ? minValue : null;
        advancedMaxPrice = Number.isFinite(maxValue) ? maxValue : null;

        if (categoryInput) {
          currentFilter = categoryInput.value || 'tatca';
        }

        setActiveFilterBadge(currentFilter);
        currentPage = 1;
        updateDisplay();
      });
    }

    if (advancedResetBtn) {
      advancedResetBtn.addEventListener('click', () => {
        if (advancedForm) advancedForm.reset();
        advancedKeyword = '';
        advancedMinPrice = null;
        advancedMaxPrice = null;
        currentFilter = 'tatca';
        setActiveFilterBadge(currentFilter);
        currentPage = 1;
        updateDisplay();
      });
    }

    // Chạy lần đầu khi vào trang
    updateDisplay();
  }

  // ==========================================================
  // TÍNH NĂNG 3: Tìm kiếm với dropdown danh sách sản phẩm
  // ==========================================================
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchBar = document.querySelector(".search-bar");
  
  if (searchInput && searchBtn && searchBar) {
    // Tạo dropdown
    let searchDropdown = document.createElement("div");
    searchDropdown.className = "search-dropdown";
    searchDropdown.id = "search-dropdown";
    searchBar.appendChild(searchDropdown);
    
    // Lấy danh sách sản phẩm từ database.js
    function getProductList() {
      if (typeof products !== 'undefined' && Array.isArray(products)) {
        return products;
      }
      // Fallback: lấy từ DOM
      const cards = document.querySelectorAll('.card');
      return Array.from(cards).map(card => {
        const name = card.querySelector('.product-name')?.innerText || '';
        const price = card.querySelector('.product-price')?.getAttribute('data-price-value') || '0';
        const image = card.querySelector('.product-image')?.src || '';
        return { name, price: parseInt(price), image };
      });
    }
    
    // Hiển thị dropdown với danh sách sản phẩm
    function showProductDropdown() {
      const products = getProductList();
      searchDropdown.innerHTML = '';
      
      if (products.length === 0) {
        searchDropdown.innerHTML = '<div style="padding: 12px; text-align: center; color: #999;">Không có sản phẩm</div>';
        searchDropdown.classList.add('active');
        return;
      }
      
      products.forEach(product => {
        const item = document.createElement("div");
        item.className = "search-dropdown-item";
        item.innerHTML = `
          <img src="${product.image || ''}" alt="${product.name}" onerror="this.style.display='none'">
          <div class="search-dropdown-item-info">
            <div class="search-dropdown-item-name">${product.name}</div>
            <div class="search-dropdown-item-price">${(product.price || 0).toLocaleString()}₫</div>
          </div>
        `;
        item.addEventListener('click', () => {
          searchInput.value = product.name;
          searchDropdown.classList.remove('active');
          filterProductsOnPage();
        });
        searchDropdown.appendChild(item);
      });
      
      searchDropdown.classList.add('active');
    }
    
    // Ẩn dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target)) {
        searchDropdown.classList.remove('active');
      }
    });
    
    // Hiển thị dropdown khi click vào input
    searchInput.addEventListener('focus', showProductDropdown);
    searchInput.addEventListener('click', showProductDropdown);
    
    // Tìm kiếm khi nhập
    function filterProductsOnPage() {
      const keyword = searchInput.value.trim().toLowerCase();
      searchDropdown.classList.remove('active');

      if (allCards.length > 0 && paginationContainer) {
        advancedKeyword = keyword;
        currentFilter = 'tatca';
        setActiveFilterBadge(currentFilter);
        currentPage = 1;
        updateDisplay();
        return;
      }
      
      let productCards = document.querySelectorAll('#product-list .card');
      if (productCards.length === 0) {
         productCards = document.querySelectorAll('#featured .card');
      }
      
      productCards.forEach((product) => {
        const title = product.querySelector(".product-name")?.innerText.toLowerCase() || "";
        const desc = product.querySelector(".muted")?.innerText.toLowerCase() || "";

        if (keyword === "") {
          product.style.display = "block";
          return;
        }

        if (title.includes(keyword) || desc.includes(keyword)) {
          product.style.display = "block";
        } else {
          product.style.display = "none";
        }
      });
    }

    searchBtn.addEventListener("click", filterProductsOnPage);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); 
        filterProductsOnPage();
      }
    });
    
    searchInput.addEventListener("keyup", (e) => {
        if (e.target.value === "") {
            filterProductsOnPage();
            const activeFilter = document.querySelector('.filterbar .badge.active');
            if (activeFilter) {
                activeFilter.click(); 
            }
        }
    });
  }

  // ==========================================================
  // TÍNH NĂNG 6: Logic ĐĂNG NHẬP (Tài khoản khách hàng mặc định)
  // ==========================================================
  const loginForm = document.getElementById('login-form');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authPanels = document.querySelectorAll('.auth-panel');
  if (authTabs.length && authPanels.length) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetSelector = tab.dataset.target;
        authTabs.forEach(t => t.classList.remove('active'));
        authPanels.forEach(panel => panel.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.querySelector(targetSelector);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }
  if(loginForm) {
    // Khởi tạo tài khoản khách hàng mặc định nếu chưa có
    function initializeDefaultCustomer() {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const defaultCustomer = users.find(u => u.email === 'khachhang@clothify.com');
      
      if (!defaultCustomer) {
        const newCustomer = {
          id: 'CUS001',
          name: 'Khách hàng',
          email: 'khachhang@clothify.com',
          password: '123456',
          phone: '',
          address: '',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        users.push(newCustomer);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Thêm vào danh sách khách hàng
        let customers = JSON.parse(localStorage.getItem('customers')) || [];
        if (!customers.find(c => c.email === 'khachhang@clothify.com')) {
          customers.push({
            id: newCustomer.id,
            name: newCustomer.name,
            email: newCustomer.email,
            createdAt: newCustomer.createdAt,
            status: 'active'
          });
          localStorage.setItem('customers', JSON.stringify(customers));
        }
      }
    }
    
    // Khởi tạo khi trang load
    initializeDefaultCustomer();
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email-login').value;
      const pass = document.getElementById('password-login').value;
      const errorEl = document.getElementById('login-error');

      // ===== ADMIN LOGIN CHECK (Ưu tiên) =====
      if (email === 'admin@clothify.com' && pass === 'admin123') {
        const adminUser = { name: 'Admin', email: 'admin@clothify.com' };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        alert('Đăng nhập Admin thành công! Đang chuyển đến trang Quản trị.');
        window.location.href = 'admin.html';
        return; 
      }
      
      // ===== TÀI KHOẢN KHÁCH HÀNG MẶC ĐỊNH =====
      if (email === 'khachhang@clothify.com' && pass === '123456') {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let foundUser = users.find(user => user.email === email);
        
        if (!foundUser) {
          initializeDefaultCustomer();
          foundUser = users.find(user => user.email === email);
        }
        
        if (foundUser && foundUser.status === 'locked') {
          errorEl.textContent = 'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên.';
          return;
        }

        if (foundUser) {
          errorEl.textContent = "";
          const { password: removedPassword, ...publicUser } = foundUser;
          localStorage.setItem('currentUser', JSON.stringify(publicUser));
          alert('Đăng nhập thành công! Chuyển về trang chủ.');
          window.location.href = 'index.html';
          return;
        }
      }
      
      // ===== TÀI KHOẢN KHÁC (nếu có) =====
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const foundUser = users.find(user => user.email === email && user.password === pass);
      
      if(foundUser) {
        if (foundUser.status === 'locked') {
          errorEl.textContent = 'Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên.';
          return;
        }
        errorEl.textContent = "";
        const { password: removedPassword, ...publicUser } = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(publicUser));
        alert('Đăng nhập thành công! Chuyển về trang chủ.');
        window.location.href = 'index.html';
      } else {
        errorEl.textContent = 'Email hoặc mật khẩu không chính xác.';
      }
    });
  }

  // ==========================================================
  // TÍNH NĂNG 6.1: Đăng ký tài khoản người dùng mới
  // ==========================================================
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('register-name');
      const phoneInput = document.getElementById('register-phone');
      const emailInput = document.getElementById('register-email');
      const pwInput = document.getElementById('register-password');
      const confirmInput = document.getElementById('register-confirm-password');
      const addressInput = document.getElementById('register-address');
      const errorEl = document.getElementById('register-error');
      const successEl = document.getElementById('register-success');

      if (!nameInput || !phoneInput || !emailInput || !pwInput || !confirmInput || !addressInput) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const password = pwInput.value.trim();
      const confirmPassword = confirmInput.value.trim();
      const address = addressInput.value.trim();

      if (errorEl) errorEl.textContent = '';
      if (successEl) successEl.textContent = '';

      if (password.length < 6) {
        if (errorEl) errorEl.textContent = 'Mật khẩu phải có tối thiểu 6 ký tự.';
        return;
      }

      if (password !== confirmPassword) {
        if (errorEl) errorEl.textContent = 'Mật khẩu nhập lại không khớp.';
        return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(user => user.email?.toLowerCase() === email)) {
        if (errorEl) errorEl.textContent = 'Email này đã tồn tại. Vui lòng chọn email khác.';
        return;
      }

      const newUser = {
        id: `CUS${Date.now()}`,
        name,
        phone,
        email,
        password,
        address,
        status: 'active',
        role: 'customer',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // cập nhật bảng customers phục vụ admin
      const customers = JSON.parse(localStorage.getItem('customers')) || [];
      customers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        phone: newUser.phone,
        address: newUser.address,
        status: 'active'
      });
      localStorage.setItem('customers', JSON.stringify(customers));

      const { password: removedPw, ...publicUser } = newUser;
      localStorage.setItem('currentUser', JSON.stringify(publicUser));

      if (successEl) {
        successEl.textContent = 'Đăng ký thành công! Đang chuyển đến trang chủ.';
        successEl.classList.add('show');
      }

      registerForm.reset();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    });
  }

  // ==========================================================
  // TÍNH NĂNG 7: Hiển thị/Ẩn thông tin Đăng nhập (Cho mọi trang)
  // (ĐÃ SỬA: Ẩn "Xin chào" nếu là Admin)
  // ==========================================================
  const currentUser = getCurrentUser();
  setupAccountDropdown(currentUser);

  // ==========================================================
  // TÍNH NĂNG 8: Xử lý Form Liên hệ (contact.html)
  // ==========================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); 

      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const title = document.getElementById('contact-title').value;
      const message = document.getElementById('contact-message').value;
      const successMsg = document.getElementById('contact-success-msg');

      if (!name || !email || !title || !message) {
        if(successMsg) successMsg.textContent = 'Vui lòng điền đầy đủ thông tin.';
        return;
      }

      let feedback = JSON.parse(localStorage.getItem('feedback')) || [];

      const newFeedback = {
        name: name,
        email: email,
        title: title,
        message: message,
        date: new Date().toLocaleString('vi-VN') 
      };
      feedback.push(newFeedback);

      localStorage.setItem('feedback', JSON.stringify(feedback));

      if(successMsg) successMsg.textContent = 'Cảm ơn bạn! Phản hồi đã được gửi thành công.';
      contactForm.reset(); 

      setTimeout(() => {
        if(successMsg) successMsg.textContent = '';
      }, 5000);
    });
  }
  // Lấy tất cả nút xác nhận trong modal thêm giỏ hàng
  const addButtons = document.querySelectorAll('#modal-confirm-add-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('✅ Bạn đã thêm sản phẩm vào giỏ hàng thành công!');
    });
  });

}); // <-- Đóng DOMContentLoaded
