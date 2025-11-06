// ==========================================================
// CHỨC NĂNG: MODAL CHỌN SIZE + THÊM GIỎ HÀNG
// (Dùng cho cả index.html và products.html)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  
  // Lấy các phần tử của Modal
  const modalOverlay = document.getElementById("size-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-add-btn");
  
  // FIX: Lấy TẤT CẢ các nút .add-to-cart-btn trên trang
  const allAddToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  // Nếu trang này không có modal (ví dụ: trang about.html) thì không chạy gì cả
  if (!modalOverlay || !modalCloseBtn || !modalConfirmBtn) {
    return;
  }

  let currentProductData = {}; // Biến tạm để giữ thông tin sản phẩm
  let selectedSize = null;     // Biến tạm để giữ size đã chọn

  // ===== GẮN SỰ KIỆN CHO NÚT "THÊM VÀO GIỎ" (TRÊN CARD SẢN PHẨM) =====
  allAddToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      // 1. Lấy thông tin từ card sản phẩm
      const productCard = event.target.closest(".card");
      const name = productCard.querySelector(".product-name").innerText;
      const priceText = productCard.querySelector(".product-price").innerText;
      const priceValue = productCard
        .querySelector(".product-price")
        .getAttribute("data-price-value");
      const image = productCard.querySelector(".product-image").src;
      const id = event.target.getAttribute("data-product-id");
      const sizesString = event.target.getAttribute("data-available-sizes");

      // 2. Lưu thông tin vào biến tạm
      currentProductData = {
        id: id,
        name: name,
        price: parseInt(priceValue),
        image: image,
      };

      // 3. Cập nhật nội dung Modal
      document.getElementById("modal-product-name").innerText = name;
      document.getElementById("modal-product-price").innerText = priceText;
      document.getElementById("modal-product-image").src = image;

      // 4. Tạo các nút chọn size
      const sizeContainer = document.getElementById("modal-size-options");
      sizeContainer.innerHTML = ""; // Xóa các nút size cũ
      selectedSize = null;          // Reset size đã chọn
      modalConfirmBtn.disabled = true; // Vô hiệu hóa nút "Thêm"

      if (sizesString) {
        const sizesArray = sizesString.split(",");
        sizesArray.forEach((size) => {
          const sizeBtn = document.createElement("button");
          sizeBtn.classList.add("size-option");
          sizeBtn.innerText = size.trim();
          sizeBtn.setAttribute("data-size", size.trim());

          // Khi bấm chọn 1 size
          sizeBtn.addEventListener("click", () => {
            // Xóa class 'active' khỏi tất cả các nút
            sizeContainer
              .querySelectorAll(".size-option")
              .forEach((btn) => btn.classList.remove("active"));
            // Thêm class 'active' cho nút vừa bấm
            sizeBtn.classList.add("active");
            // Lưu lại size đã chọn
            selectedSize = size.trim();
            // Kích hoạt nút "Thêm"
            modalConfirmBtn.disabled = false;
          });

          sizeContainer.appendChild(sizeBtn);
        });
      } else {
        // Trường hợp sản phẩm không có size (hiếm)
        sizeContainer.innerHTML = "<p>Sản phẩm này không có tùy chọn size.</p>";
        selectedSize = "One Size"; // Gán 1 size mặc định
        modalConfirmBtn.disabled = false;
      }

      // 5. Hiển thị Modal
      modalOverlay.classList.add("active");
    });
  });

  // ===== NÚT "XÁC NHẬN THÊM" TRONG MODAL =====
  modalConfirmBtn.addEventListener("click", () => {
    if (!selectedSize) {
      // (Trường hợp này đã được chặn bởi .disabled, nhưng cẩn thận vẫn hơn)
      alert("Vui lòng chọn size sản phẩm!");
      return;
    }

    // 1. Tạo đối tượng sản phẩm hoàn chỉnh
    const productToAdd = {
      ...currentProductData,
      size: selectedSize,
      quantity: 1,
      // uniqueId = ID sản phẩm + Size (ví dụ: SP001-M)
      uniqueId: currentProductData.id + "-" + selectedSize, 
    };

    // 2. Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // 3. Kiểm tra xem sản phẩm (với size đó) đã có trong giỏ chưa
    const existingIndex = cart.findIndex(
      (item) => item.uniqueId === productToAdd.uniqueId
    );

    if (existingIndex > -1) {
      // Nếu đã có, chỉ tăng số lượng
      cart[existingIndex].quantity += 1;
    } else {
      // Nếu chưa có, thêm mới vào giỏ
      cart.push(productToAdd);
    }

    // 4. Lưu giỏ hàng mới
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // 5. Cập nhật icon giỏ hàng (gọi hàm từ script.js)
    if (typeof updateCartCounter === 'function') {
      updateCartCounter();
    }
    
    // 6. Đóng modal
    closeModal();
  });

  // ===== HÀM ĐÓNG MODAL =====
  function closeModal() {
    modalOverlay.classList.remove("active");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  
  // Bấm ra ngoài vùng xám cũng đóng modal
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });
});