document.addEventListener('DOMContentLoaded', () => {
  
    // 1. Lấy ID sản phẩm từ URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
  
    // 2. Tìm sản phẩm trong database (allProducts lấy từ database.js)
    // Lưu ý: Biến trong database.js của bạn tên là "products" hay "allProducts"? 
    // Dựa trên các bước trước, mình dùng biến "products" (nếu lỗi hãy đổi thành allProducts)
    const product = products.find(p => p.id === productId);
  
    const container = document.getElementById('product-detail');
  
    if (product) {
      // === HIỂN THỊ THÔNG TIN LÊN TRANG CHI TIẾT ===
      container.innerHTML = `
        <div>
          <img src="${product.image}" alt="${product.name}" class="detail-img" id="main-detail-img">
        </div>
        <div class="detail-info">
          <h1 id="main-detail-name">${product.name}</h1>
          <div class="detail-price" id="main-detail-price">${product.price.toLocaleString()}₫</div>
          <p class="detail-desc">${product.desc || product.description}</p>
          
          <button class="btn primary" id="open-size-modal-btn">
            Thêm vào giỏ
          </button>
          <a href="index.html" class="btn ghost">Quay lại</a>
        </div>
      `;
  
      // === XỬ LÝ MODAL CHỌN SIZE ===
      const modal = document.getElementById('size-modal');
      const openBtn = document.getElementById('open-size-modal-btn');
      const closeBtn = document.getElementById('modal-close-btn');
      const confirmBtn = document.getElementById('modal-confirm-add-btn');
      
      const modalImg = document.getElementById('modal-product-image');
      const modalName = document.getElementById('modal-product-name');
      const modalPrice = document.getElementById('modal-product-price');
      const sizeContainer = document.getElementById('modal-size-options');
      
      let selectedSize = null; // Biến lưu size người dùng chọn
  
      // A. Khi bấm nút "Thêm vào giỏ" ở trang chi tiết
      openBtn.addEventListener('click', () => {
        // 1. Điền thông tin vào Modal
        modalImg.src = product.image;
        modalName.textContent = product.name;
        modalPrice.textContent = product.price.toLocaleString() + '₫';
        
        // 2. Tạo các nút Size
        sizeContainer.innerHTML = ''; // Xóa size cũ
        selectedSize = null; // Reset size đã chọn
        
        // Kiểm tra xem database có availableSizes không, nếu không có thì mặc định S,M,L
        const sizes = product.availableSizes || ["S", "M", "L", "XL"];
        
        sizes.forEach(size => {
          const span = document.createElement('span');
          span.classList.add('size-option'); // Class CSS cho ô size
          span.textContent = size;
          
          // Sự kiện chọn size
          span.addEventListener('click', () => {
            // Xóa class active ở các nút khác
            document.querySelectorAll('.size-option').forEach(s => s.classList.remove('active'));
            // Thêm class active cho nút vừa bấm
            span.classList.add('active');
            selectedSize = size;
          });
          
          sizeContainer.appendChild(span);
        });
  
        // 3. Hiện Modal
        modal.classList.add('active');
      });
  
      // B. Khi bấm nút "Xác nhận thêm" trong Modal
      confirmBtn.addEventListener('click', () => {
        if (!selectedSize) {
          alert("Vui lòng chọn size!");
          return;
        }
  
        // Thêm vào localStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Tạo ID duy nhất cho sản phẩm theo size (để SP001 size S khác SP001 size M)
        // Hoặc nếu bạn muốn gộp chung ID thì giữ nguyên product.id
        // Ở đây tôi giữ nguyên logic cũ của bạn:
        
        const cartItem = {
            id: product.id, // Hoặc `${product.id}-${selectedSize}` nếu muốn tách riêng dòng
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            size: selectedSize // Lưu thêm thông tin size
        };
  
        // Kiểm tra trùng lặp (Cùng ID và Cùng Size)
        const existing = cart.find(item => item.id === cartItem.id && item.size === selectedSize);
        
        if (existing) {
            existing.quantity++;
        } else {
            cart.push(cartItem);
        }
  
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Cập nhật badge
        if(typeof updateCartCounter === 'function') updateCartCounter();
  
        // Đóng modal và thông báo
        modal.classList.remove('active');
        alert(`Đã thêm "${product.name}" (Size: ${selectedSize}) vào giỏ!`);
      });
  
      // C. Các nút đóng Modal
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
  
      // Bấm ra ngoài vùng trắng thì đóng modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
  
    } else {
      container.innerHTML = "<h2>Không tìm thấy sản phẩm!</h2>";
    }
});