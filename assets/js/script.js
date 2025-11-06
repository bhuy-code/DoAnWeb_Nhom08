// ==========================================================
// HÀM TOÀN CỤC: Cập nhật chỉ báo số lượng giỏ hàng (Badge)
// (Đặt bên ngoài DOMContentLoaded để các file khác có thể gọi)
// ==========================================================
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  // Tính tổng số lượng SẢN PHẨM (ví dụ: 2 áo + 1 quần = 3)
  const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  
  // Tìm bộ đếm
  const counterElement = document.getElementById('cart-counter');
  if (counterElement) {
    if (totalQuantity > 0) {
      counterElement.textContent = totalQuantity;
      counterElement.style.display = 'inline-block'; // Hiển thị
    } else {
      counterElement.style.display = 'none'; // Ẩn nếu bằng 0
    }
  }
};

// Chờ cho toàn bộ nội dung trang web được tải xong
document.addEventListener('DOMContentLoaded', () => {

  console.log('Clothify JS (script.js) đã sẵn sàng!');
  
  // Gọi hàm này ngay khi tải trang để lấy số lượng mới nhất
  updateCartCounter();

  // ==========================================================
  // TÍNH NĂNG 1 (SỬA LỖI): Thêm vào giỏ hàng TRỰC TIẾP (cho index.html)
  // FIX: Đổi tên class "add-to-cart-btn-direct" để tránh xung đột
  // với "add-to-cart-btn" (có modal) bên file products.js
  // ==========================================================
  
  document.querySelectorAll(".add-to-cart-btn-direct").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".card");
      const name = card.querySelector(".product-name").innerText;
      const price = parseInt(card.querySelector(".product-price").dataset.priceValue);
      const image = card.querySelector(".product-image").src;
      const id = button.dataset.productId;
      // Vì đây là thêm trực tiếp, ta tự gán 1 size mặc định (hoặc lấy từ data-attribute)
      const size = button.dataset.availableSizes.split(',')[0] || 'M'; 

      // Tạo đối tượng sản phẩm
      const product = {
        id: id,
        name: name,
        price: price,
        image: image,
        size: size,
        quantity: 1,
        uniqueId: id + "-" + size // Tạo ID duy nhất dựa trên size
      };

      // Lấy giỏ hàng hiện tại
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Kiểm tra nếu sản phẩm (với size đó) đã có
      const existing = cart.find(item => item.uniqueId === product.uniqueId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push(product);
      }

      // Lưu lại vào localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Cập nhật bộ đếm trên header
      updateCartCounter();

      // === Hiệu ứng nút ===
      const originalText = "Thêm vào giỏ";
      
      if (!button.classList.contains('added')) {
        button.textContent = 'Đã thêm!';
        button.classList.add('added');
        button.style.backgroundColor = '#22a06b'; // Màu xanh
        button.style.borderColor = '#22a06b';

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('added');
          button.style.backgroundColor = ''; // Xoá style
          button.style.borderColor = '';
        }, 1500);
      }
    });
  });

  // ==========================================================
  // TÍNH NĂNG 2: Lọc sản phẩm (trang "products.html")
  // (Giữ nguyên, nhưng chỉ chạy nếu thấy .filterbar)
  // ==========================================================
  const filterBar = document.querySelector('.filterbar');
  if (filterBar) {
    const filterButtons = filterBar.querySelectorAll('.badge[data-filler]');
    const productCards = document.querySelectorAll('#product-list .card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 1. Cập nhật giao diện nút (thêm/xoá class 'active')
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 2. Lấy giá trị lọc (từ data-filler="...")
        const filterValue = button.dataset.filler.toLowerCase();
        
        // 3. Lọc sản phẩm
        // LƯU Ý: logic lọc này yêu cầu card sản phẩm phải có data-category
        // Ví dụ: <article class="card" data-category="nam">
        // Code HTML gốc không có, nên hàm lọc này sẽ không hoạt động
        // chính xác 100% trừ khi bạn thêm data-category vào HTML.
        // Tuy nhiên, logic cơ bản là đúng.
        
        productCards.forEach(card => {
          // Lấy category từ tên sản phẩm (cách chữa cháy)
          const title = card.querySelector('.product-name').innerText.toLowerCase();
          
          if (filterValue === 'tất cả') {
            card.style.display = 'block';
          } else if (filterValue === 'nam' && title.includes('nam')) {
            card.style.display = 'block';
          } else if (filterValue === 'nữ' && title.includes('nữ')) {
            card.style.display = 'block';
          } else if (filterValue === 'phụ kiện' && (title.includes('mũ') || title.includes('túi'))) {
            // ví dụ
            card.style.display = 'block';
          } else if (filterValue !== 'nam' && filterValue !== 'nữ' && filterValue !== 'phụ kiện') {
            // Fallback nếu category không rõ ràng (ví dụ: Áo len)
             if (!title.includes('nam') && !title.includes('nữ')) {
                card.style.display = 'block';
             } else {
                card.style.display = 'none';
             }
          }
          else {
            card.style.display = 'none';
          }

          // Cách lọc chuẩn nếu HTML có data-category
          // const cardCategory = card.dataset.category || 'none';
          // if (filterValue === 'tất cả' || filterValue === cardCategory) {
          //   card.style.display = 'block';
          // } else {
          //   card.style.display = 'none';
          // }
        });
      });
    });
  }

  // ==========================================================
  // TÍNH NĂNG 3: Tìm kiếm (cho products.html và index.html)
  // (Lấy từ file products.js cũ)
  // ==========================================================
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  if (searchInput && searchBtn) {
    function filterProductsOnPage() {
      const keyword = searchInput.value.trim().toLowerCase();
      
      // Lấy danh sách card sản phẩm tùy theo trang
      let productCards = document.querySelectorAll('#product-list .card'); // Trang Products
      if (productCards.length === 0) {
         productCards = document.querySelectorAll('#featured .card'); // Trang Index
      }
      
      let foundCount = 0;
      productCards.forEach((product) => {
        const title = product.querySelector(".product-name")?.innerText.toLowerCase() || "";
        const desc = product.querySelector(".muted")?.innerText.toLowerCase() || "";

        if (keyword === "") {
          product.style.display = "block";
          foundCount++;
          return;
        }

        if (title.includes(keyword) || desc.includes(keyword)) {
          product.style.display = "block";
          foundCount++;
        } else {
          product.style.display = "none";
        }
      });
      
      // (Tùy chọn) Hiển thị thông báo nếu không tìm thấy
      // Bạn có thể thêm 1 thẻ <p id="search-result-msg"></p> vào HTML
      const msgEl = document.getElementById('search-result-msg');
      if (msgEl) {
          if(foundCount === 0) {
            msgEl.innerText = "Không tìm thấy sản phẩm nào phù hợp.";
          } else {
            msgEl.innerText = "";
          }
      }
    }

    searchBtn.addEventListener("click", filterProductsOnPage);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Ngăn form submit (nếu có)
        filterProductsOnPage();
      }
    });
  }


}); // <-- Đóng DOMContentLoaded
