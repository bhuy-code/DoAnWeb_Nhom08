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
  
  // Gọi hàm này ngay khi tải trang để lấy số lượng mới nhất
  updateCartCounter();

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

      const newUser = { name: name, email: email, password: pass };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
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
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
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
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const ctaContainer = document.querySelector('.header .cta');

  if (currentUser && ctaContainer) {
    
    // 1. Tạo HTML cơ bản (chỉ có nút Đăng xuất)
    let ctaHTML = `
      <a href="#" class="btn ghost" id="logout-btn">Đăng xuất</a>
    `;

    // 2. KIỂM TRA: Nếu không phải Admin (là khách hàng)
    // thì mới thêm "Xin chào, [Tên]"
    if (currentUser.email !== 'admin@clothify.com') {
      ctaHTML = `
        <span style="font-weight: 600; margin-right: 10px;">Xin chào, ${currentUser.name}!</span>
        ${ctaHTML}
      `;
    }
    
    // 3. Cập nhật HTML
    ctaContainer.innerHTML = ctaHTML;

    // 4. Gán sự kiện click
    ctaContainer.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        e.preventDefault();
        
        const userOnLogout = JSON.parse(localStorage.getItem('currentUser'));
        const isAdmin = (userOnLogout && userOnLogout.email === 'admin@clothify.com');
        
        localStorage.removeItem('currentUser'); // Xóa phiên đăng nhập
        
        if (isAdmin) {
          alert('Đã đăng xuất khỏi tài khoản Admin.');
          window.location.href = 'login.html'; // Về trang đăng nhập
        } else {
          alert('Đã đăng xuất.');
          window.location.reload(); // Tải lại trang
        }
      }
    });
    
  } else if (ctaContainer) {
    // (Chưa đăng nhập, giữ nguyên HTML gốc)
  }

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

}); // <-- Đóng DOMContentLoaded