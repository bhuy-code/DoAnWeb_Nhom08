// ==========================================================
// FILE JS ĐƠN GIẢN - CHỈ GIỮ PHẦN CẦN THIẾT
// ==========================================================

// Cập nhật số lượng giỏ hàng
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
}

// Các hằng số
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

// Hàm tiện ích
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
  return `DH${Date.now()}${Math.floor(Math.random() * 9000) + 1000}`;
}

function formatCurrency(value) {
  return (value || 0).toLocaleString('vi-VN');
}

// Khởi tạo dữ liệu
function initializeInventory() {
  if (!localStorage.getItem('masterInventory')) {
    const initialInventory = [
      { id: 'SP001', name: 'Áo thun basic Form Nữ', stock: 120 },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', stock: 80 },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', stock: 50 },
      { id: 'SP004', name: 'Áo len nữ', stock: 75 },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', stock: 90 },
      { id: 'SP006', name: 'Jeans Baggy', stock: 65 },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', stock: 40 },
      { id: 'SP008', name: 'Jeans Baggy Short', stock: 110 },
      { id: 'SP009', name: 'Áo khoác Bomber', stock: 30 },
      { id: 'SP010', name: 'Áo khoác chần bông lai', stock: 45 },
      { id: 'SP011', name: 'Quần thể thao nữ', stock: 85 },
      { id: 'SP012', name: 'Quần thể thao nam dài', stock: 60 }
    ];
    localStorage.setItem('masterInventory', JSON.stringify(initialInventory));
  }
}

function initializeProductCatalog() {
  if (!localStorage.getItem('productCatalog')) {
    const catalog = [
      { id: 'SP001', name: 'Áo thun basic Form Nữ', price: 199000, category: 'nu' },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', price: 249000, category: 'nam' },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', price: 299000, category: 'nam' },
      { id: 'SP004', name: 'Áo len nữ', price: 349000, category: 'nu' },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', price: 399000, category: 'nam' },
      { id: 'SP006', name: 'Jeans Baggy', price: 449000, category: 'nam' },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', price: 499000, category: 'nam' },
      { id: 'SP008', name: 'Jeans Baggy Short', price: 549000, category: 'nam' },
      { id: 'SP009', name: 'Áo khoác Bomber', price: 599000, category: 'nam' },
      { id: 'SP010', name: 'Áo khoác chần bông lai', price: 649000, category: 'nam' },
      { id: 'SP011', name: 'Quần thể thao nữ', price: 699000, category: 'nu' },
      { id: 'SP012', name: 'Quần thể thao nam dài', price: 749000, category: 'nam' }
    ];
    localStorage.setItem('productCatalog', JSON.stringify(catalog));
  }
}

function deductInventoryForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return;
  const inventory = JSON.parse(localStorage.getItem('masterInventory')) || [];
  order.items.forEach(item => {
    const inventoryItem = inventory.find(inv => inv.id === item.productId);
    if (inventoryItem) {
      inventoryItem.stock = Math.max(0, (inventoryItem.stock || 0) - (item.quantity || 0));
    }
  });
  localStorage.setItem('masterInventory', JSON.stringify(inventory));
}

// Hiển thị thông tin người dùng
function setupAccountDropdown(currentUser) {
  const ctaContainer = document.querySelector('.header .cta');
  if (!ctaContainer || !currentUser) return;

  if (currentUser.email === 'admin@clothify.com') {
    ctaContainer.innerHTML = `<a href="#" class="btn ghost" id="logout-btn">Đăng xuất</a>`;
    ctaContainer.querySelector('#logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
    return;
  }

  ctaContainer.innerHTML = `
    <span style="margin-right:10px;">Xin chào, ${currentUser.name}!</span>
    <a href="account.html" class="btn ghost small">Tài khoản</a>
    <a href="#" class="btn ghost" id="logout-btn">Đăng xuất</a>
  `;
  ctaContainer.querySelector('#logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  });
}

// ==========================================================
// TÌM KIẾM NÂNG CAO
// ==========================================================
function setupAdvancedSearch() {
  const form = document.getElementById('advanced-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = form.querySelector('input[name="keyword"]')?.value.trim().toLowerCase() || '';
    const category = form.querySelector('select[name="category"]')?.value || 'tatca';
    const minPrice = parseInt(form.querySelector('input[name="priceMin"]')?.value) || 0;
    const maxPrice = parseInt(form.querySelector('input[name="priceMax"]')?.value) || 999999999;

    const cards = document.querySelectorAll('.grid .card');
    cards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      const title = card.querySelector('.product-name')?.innerText.toLowerCase() || '';
      const priceValue = parseInt(card.querySelector('.product-price')?.getAttribute('data-price-value') || '0');

      const matchKeyword = !keyword || title.includes(keyword);
      const matchCategory = category === '' || category === 'tatca' || cardCategory === category;
      const matchPrice = priceValue >= minPrice && priceValue <= maxPrice;

      if (matchKeyword && matchCategory && matchPrice) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Cập nhật filter badge
    document.querySelectorAll('.filterbar .badge').forEach(badge => {
      badge.classList.toggle('active', badge.dataset.filler === (category || 'tatca'));
    });
  });

  // Nút reset
  const resetBtn = document.getElementById('reset-advanced-search');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      const cards = document.querySelectorAll('.grid .card');
      cards.forEach(card => card.style.display = 'flex');
      document.querySelectorAll('.filterbar .badge').forEach(badge => {
        badge.classList.toggle('active', badge.dataset.filler === 'tatca');
      });
    });
  }
}

// ==========================================================
// PHÂN TRANG ĐƠN GIẢN
// ==========================================================
function setupPagination() {
  const allCards = document.querySelectorAll('.grid .card');
  const paginationContainer = document.getElementById('pagination');
  if (!allCards.length || !paginationContainer) return;

  let currentPage = 1;
  const itemsPerPage = window.location.pathname.includes('products.html') ? 8 : 4;

  function updateDisplay() {
    const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
    const totalPages = Math.ceil(visibleCards.length / itemsPerPage);
    
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    visibleCards.forEach((card, index) => {
      if (index >= start && index < end) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        updateDisplay();
      };
      paginationContainer.appendChild(btn);
    }
  }

  // Lọc theo category - SỬA LẠI ĐỂ HOẠT ĐỘNG ĐÚNG
  const filterBadges = document.querySelectorAll('.filterbar .badge');
  if (filterBadges.length > 0) {
    filterBadges.forEach(badge => {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', (e) => {
        e.preventDefault();
        const category = badge.getAttribute('data-filler') || 'tatca';
        
        // Cập nhật active state
        filterBadges.forEach(b => b.classList.remove('active'));
        badge.classList.add('active');

        // Lọc sản phẩm
        allCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category') || '';
          if (category === 'tatca' || cardCategory === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });

        // Reset về trang 1 và cập nhật phân trang
        currentPage = 1;
        updateDisplay();
      });
    });
  }

  updateDisplay();
}

// ==========================================================
// TÌM KIẾM CƠ BẢN
// ==========================================================
function setupBasicSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  if (!searchInput || !searchBtn) return;

  function doSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
      // Chuyển đến trang kết quả tìm kiếm
      window.location.href = `search-results.html?q=${encodeURIComponent(keyword)}`;
    } else {
      // Nếu không có từ khóa, chuyển đến trang sản phẩm
      window.location.href = 'products.html';
    }
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });
}

// ==========================================================
// ĐĂNG NHẬP / ĐĂNG KÝ
// ==========================================================
function setupAuth() {
  // Tab chuyển đổi - SỬA LẠI ĐỂ HOẠT ĐỘNG ĐÚNG
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      if (!target) return;
      
      // Cập nhật tab
      document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.remove('active');
        t.style.background = '#fff';
        t.style.borderBottom = '3px solid transparent';
        t.style.color = '';
      });
      tab.classList.add('active');
      if (target === '#register-view') {
        tab.style.background = '#f0f7ff';
        tab.style.borderBottom = '3px solid #007bff';
        tab.style.color = '#007bff';
      } else {
        tab.style.background = '#fff';
        tab.style.borderBottom = '3px solid #007bff';
      }
      
      // Cập nhật panel
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      const targetPanel = document.querySelector(target);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Đăng nhập
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email-login').value;
      const pass = document.getElementById('password-login').value;
      const errorEl = document.getElementById('login-error');

      // Admin
      if (email === 'admin@clothify.com' && pass === 'admin123') {
        localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', email: 'admin@clothify.com' }));
        alert('✓ Đăng nhập thành công!');
        window.location.href = 'admin.html';
        return;
      }

      // Khách hàng
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === pass);
      if (user) {
        if (user.status === 'locked') {
          errorEl.textContent = 'Tài khoản đã bị khóa.';
          return;
        }
        const { password, ...publicUser } = user;
        localStorage.setItem('currentUser', JSON.stringify(publicUser));
        alert('✓ Đăng nhập thành công!');
        window.location.href = 'index.html';
      } else {
        errorEl.textContent = 'Email hoặc mật khẩu không đúng.';
      }
    });
  }

  // Đăng ký - VÔ HIỆU HÓA (chỉ để nền, không hoạt động)
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Chức năng đăng ký tạm thời không khả dụng. Vui lòng sử dụng tài khoản mặc định để đăng nhập.');
    });
  }
}

// ==========================================================
// KHỞI TẠO DỮ LIỆU MẶC ĐỊNH
// ==========================================================
function initializeDefaultData() {
  // Khởi tạo tài khoản khách hàng mặc định
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const defaultCustomer = users.find(u => u.email === 'khachhang@clothify.com');
  
  if (!defaultCustomer) {
    const newCustomer = {
      id: 'CUS000',
      name: 'Khách hàng',
      email: 'khachhang@clothify.com',
      password: '123456',
      phone: '0901234567',
      address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    users.push(newCustomer);
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Khởi tạo admin user
  const adminUser = users.find(u => u.email === 'admin@clothify.com');
  if (!adminUser) {
    users.push({
      id: 'ADM001',
      name: 'Admin',
      email: 'admin@clothify.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
  }

  initializeInventory();
  initializeProductCatalog();
  
  // Khởi tạo dữ liệu mẫu cho admin (nếu chưa có)
  if (typeof initializeAdminSampleData === 'function') {
    initializeAdminSampleData();
  }
}

// ==========================================================
// KHỞI TẠO
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  initializeDefaultData();
  updateCartCounter();
  
  const currentUser = getCurrentUser();
  setupAccountDropdown(currentUser);
  setupBasicSearch();
  setupAdvancedSearch();
  setupPagination();
  setupAuth();
});
