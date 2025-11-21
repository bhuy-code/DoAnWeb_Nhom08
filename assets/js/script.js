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
  qr: 'Chuyển khoản qua QR'
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
      { id: 'SP001', name: 'Áo thun basic Form Nữ', price: 199000 },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', price: 249000 },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', price: 299000 },
      { id: 'SP004', name: 'Áo len nữ', price: 349000 },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', price: 399000 },
      { id: 'SP006', name: 'Jeans Baggy', price: 449000 },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', price: 499000 },
      { id: 'SP008', name: 'Jeans Baggy Short', price: 549000 },
      { id: 'SP009', name: 'Áo khoác Bomber', price: 599000 },
      { id: 'SP010', name: 'Áo khoác chần bông lai', price: 649000 },
      { id: 'SP011', name: 'Quần thể thao nữ', price: 279000 },
      { id: 'SP012', name: 'Quần thể thao nam dài', price: 299000 }
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

function deductInventoryForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) return;

  const inventory = JSON.parse(localStorage.getItem('masterInventory')) || [];
  let changed = false;

  order.items.forEach(item => {
    const inventoryItem = inventory.find(inv => inv.id === item.productId);
    if (inventoryItem) {
      inventoryItem.stock = Math.max(0, (inventoryItem.stock || 0) - (item.quantity || 0));
      changed = true;
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
    
    // Lưu vào localStorage
    localStorage.setItem('masterInventory', JSON.stringify(initialInventory));
  }
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
  
  // Gọi hàm này ngay khi tải trang để lấy số lượng mới nhất
  updateCartCounter();
  syncCartToActiveOrder();

  // ==========================================================
  // TÍNH NĂNG 2: Lọc sản phẩm (trang "products.html")
  // ==========================================================
  const filterBar = document.querySelector('.filterbar');
  if (filterBar) {
    const filterButtons = filterBar.querySelectorAll('.badge[data-filler]');
    const productCards = document.querySelectorAll('#product-list .card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 1. Cập nhật giao diện nút
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 2. Lấy giá trị lọc (ví dụ: "tatca", "nam", "nu")
        const filterValue = button.dataset.filler;
        
        // 3. Lọc sản phẩm
        productCards.forEach(card => {
          // Lấy category của card (ví dụ: "nam", "nu")
          const cardCategory = card.dataset.category;

          if (filterValue === 'tatca' || filterValue === cardCategory) {
            card.style.display = 'block'; // Hiện
          } else {
            card.style.display = 'none'; // Ẩn
          }
        });
      });
    });
  }

  // ==========================================================
  // TÍNH NĂNG 3: Tìm kiếm (cho products.html và index.html)
  // ==========================================================
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  if (searchInput && searchBtn) {
    function filterProductsOnPage() {
      const keyword = searchInput.value.trim().toLowerCase();
      
      let productCards = document.querySelectorAll('#product-list .card'); // Trang Products
      if (productCards.length === 0) {
         productCards = document.querySelectorAll('#featured .card'); // Trang Index
      }
      
      let foundCount = 0;
      productCards.forEach((product) => {
        const title = product.querySelector(".product-name")?.innerText.toLowerCase() || "";
        const desc = product.querySelector(".muted")?.innerText.toLowerCase() || "";

        const isHiddenByFilter = (product.style.display === 'none');

        if (!isHiddenByFilter || keyword === "") {
            if (keyword === "") {
              product.style.display = "block"; // Reset
              foundCount++;
              return;
            }

            if (title.includes(keyword) || desc.includes(keyword)) {
              product.style.display = "block";
              foundCount++;
            } else {
              product.style.display = "none";
            }
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
  // TÍNH NĂNG 4: Chuyển đổi Form Đăng nhập / Đăng ký
  // ==========================================================
  const showRegisterBtn = document.getElementById('show-register-btn');
  const showLoginBtn = document.getElementById('show-login-btn');
  const loginView = document.getElementById('login-view');
  const registerView = document.getElementById('register-view');

  if (showRegisterBtn && showLoginBtn && loginView && registerView) {
    
    showRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      loginView.style.display = 'none';
      registerView.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      loginView.style.display = 'block';
      registerView.style.display = 'none';
    });
  }
  
  // ==========================================================
  // TÍNH NĂNG 5: Logic ĐĂNG KÝ
  // ==========================================================
  const registerForm = document.getElementById('register-form');
  if(registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      const confirmPass = document.getElementById('reg-confirm-password').value;
      const errorEl = document.getElementById('register-error');
      
      if (!name || !email || !pass || !confirmPass) {
        errorEl.textContent = 'Vui lòng điền đầy đủ thông tin.';
        return;
      }
      if (pass !== confirmPass) {
        errorEl.textContent = 'Mật khẩu xác nhận không khớp.';
        return;
      }
      if (pass.length < 6) {
        errorEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        return;
      }

      let users = JSON.parse(localStorage.getItem('users')) || [];
      const emailExists = users.find(user => user.email === email);
      
      if (emailExists) {
        errorEl.textContent = 'Email này đã được sử dụng.';
        return;
      }

      const newUser = {
        id: `CUS${Date.now()}${Math.floor(Math.random() * 1000)}`,
        name: name,
        email: email,
        password: pass,
        phone: '',
        address: '',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      const customers = JSON.parse(localStorage.getItem('customers')) || [];
      customers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      });
      localStorage.setItem('customers', JSON.stringify(customers));
      
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      errorEl.textContent = '';
      
      registerForm.reset();
      loginView.style.display = 'block';
      registerView.style.display = 'none';
    });
  }
  
  // ==========================================================
  // TÍNH NĂNG 6: Logic ĐĂNG NHẬP
  // ==========================================================
  const loginForm = document.getElementById('login-form');
  if(loginForm) {
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
        window.location.href = 'admin.html'; // Chuyển đến trang admin
        return; 
      }
      
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const foundUser = users.find(user => user.email === email && user.password === pass);
      
      if(foundUser) {
        errorEl.textContent = "";
        const { password: removedPassword, ...publicUser } = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(publicUser));
        alert('Đăng nhập thành công! Chuyển về trang chủ.');
        window.location.href = 'index.html'; // Chuyển về trang chủ
      } else {
        errorEl.textContent = 'Email hoặc mật khẩu không chính xác.';
      }
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