// ===============================
// CHỨC NĂNG MODAL CHỌN SIZE + THÊM GIỎ HÀNG (Cho products.html)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("size-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-add-btn");
  // FIX: Đổi selector để chỉ bắt nút trên trang này
  const allAddToCartButtons = document.querySelectorAll("#product-list .add-to-cart-btn");

  if (!modalOverlay) return; // Thoát nếu không phải trang products.html

  let currentProductData = {};
  let selectedSize = null;

  // ===== GẮN SỰ KIỆN CHO NÚT "THÊM VÀO GIỎ" =====
  allAddToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const productCard = event.target.closest(".card");
      const name = productCard.querySelector(".product-name").innerText;
      const price = productCard.querySelector(".product-price").innerText;
      const priceValue = productCard
        .querySelector(".product-price")
        .getAttribute("data-price-value");
      const image = productCard.querySelector(".product-image").src;
      const id = event.target.getAttribute("data-product-id");
      const sizesString = event.target.getAttribute("data-available-sizes");

      currentProductData = {
        id: id,
        name: name,
        price: parseInt(priceValue),
        image: image,
      };

      // Cập nhật nội dung Modal
      document.getElementById("modal-product-name").innerText = name;
      document.getElementById("modal-product-price").innerText = price;
      document.getElementById("modal-product-image").src = image;

      const sizeContainer = document.getElementById("modal-size-options");
      sizeContainer.innerHTML = "";
      selectedSize = null; // Reset size đã chọn
      modalConfirmBtn.disabled = true; // Vô hiệu hóa nút cho đến khi chọn size

      if (sizesString) {
        const sizesArray = sizesString.split(",");
        sizesArray.forEach((size) => {
          const sizeBtn = document.createElement("button");
          sizeBtn.classList.add("size-option");
          sizeBtn.innerText = size.trim();
          sizeBtn.setAttribute("data-size", size.trim());

          sizeBtn.addEventListener("click", () => {
            sizeContainer
              .querySelectorAll(".size-option")
              .forEach((btn) => btn.classList.remove("active"));
            sizeBtn.classList.add("active");
            selectedSize = size.trim();
            modalConfirmBtn.disabled = false; // Kích hoạt nút
          });

          sizeContainer.appendChild(sizeBtn);
        });
      } else {
        sizeContainer.innerHTML = "<p>Sản phẩm này hiện không có tùy chọn size.</p>";
        selectedSize = 'default'; // Cho phép thêm nếu không có size
        modalConfirmBtn.disabled = false;
      }

      modalOverlay.classList.add("active");
    });
  });

  // ===== NÚT "XÁC NHẬN" TRONG MODAL =====
  modalConfirmBtn.addEventListener("click", () => {
    if (!selectedSize) {
      // Cái này gần như không xảy ra vì nút đã bị vô hiệu hóa
      alert("Vui lòng chọn size sản phẩm!"); 
      return;
    }

    const productToAdd = {
      ...currentProductData,
      size: selectedSize,
      quantity: 1,
      uniqueId: currentProductData.id + "-" + selectedSize, // ID duy nhất
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(
      (item) => item.uniqueId === productToAdd.uniqueId
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(productToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // alert("Đã thêm sản phẩm vào giỏ hàng!"); // Tạm tắt alert
    
    // FIX: Gọi hàm updateCartCounter() để cập nhật icon giỏ hàng ngay lập tức
    if (typeof updateCartCounter === 'function') {
      updateCartCounter();
    }
    
    closeModal();
  });

  // ===== HÀM ĐÓNG MODAL =====
  function closeModal() {
    modalOverlay.classList.remove("active");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  // ===============================
  // CHỨC NĂNG TÌM KIẾM (Đã chuyển sang script.js)
  // ===============================
  // Khối code tìm kiếm đã được di dời sang file script.js
  // để dùng chung cho cả trang chủ và trang sản phẩm.
  
});
