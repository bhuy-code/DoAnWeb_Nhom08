// ==========================================================
// CHỨC NĂNG: MODAL CHỌN SIZE + NHẬP SỐ LƯỢNG + THÊM GIỎ HÀNG
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  
  const modalOverlay = document.getElementById("size-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-add-btn");
  
  // CHÚNG TA SẼ LẮNG NGHE SỰ KIỆN TRÊN TOÀN BỘ DANH SÁCH SẢN PHẨM (Event Delegation)
  // Thay vì tìm từng nút một.
  const productListContainer = document.getElementById("product-list") || document.querySelector(".grid");

  if (!modalOverlay || !modalCloseBtn || !modalConfirmBtn) return;

  let currentProductData = {};
  let selectedSize = null;

  // ===== HÀM MỞ MODAL (Được gọi khi click vào nút Thêm) =====
  function openSizeModal(button) {
      // 🔒 KIỂM TRA ĐĂNG NHẬP
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("⚠️ Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "login.html"; 
        return;
      }

      // Lấy thông tin sản phẩm từ thẻ cha .card
      const productCard = button.closest(".card");
      if (!productCard) return;

      const name = productCard.querySelector(".product-name").innerText;
      const priceText = productCard.querySelector(".product-price").innerText;
      const priceValue = productCard.querySelector(".product-price").getAttribute("data-price-value");
      const image = productCard.querySelector(".product-image").src;
      const id = button.getAttribute("data-product-id");
      const sizesString = button.getAttribute("data-available-sizes");

      // Lưu dữ liệu tạm
      currentProductData = {
        id: id,
        name: name,
        price: parseInt(priceValue),
        image: image,
      };

      // Điền thông tin vào Modal
      document.getElementById("modal-product-name").innerText = name;
      document.getElementById("modal-product-price").innerText = priceText;
      document.getElementById("modal-product-image").src = image;

      // Tạo các nút chọn Size
      const sizeContainer = document.getElementById("modal-size-options");
      sizeContainer.innerHTML = "";
      selectedSize = null;
      modalConfirmBtn.disabled = true;

      if (sizesString) {
        const sizesArray = sizesString.split(",");
        sizesArray.forEach((size) => {
          const sizeBtn = document.createElement("button");
          sizeBtn.classList.add("size-option");
          sizeBtn.innerText = size.trim();
          sizeBtn.setAttribute("data-size", size.trim());

          sizeBtn.addEventListener("click", () => {
            sizeContainer.querySelectorAll(".size-option").forEach((btn) => btn.classList.remove("active"));
            sizeBtn.classList.add("active");
            selectedSize = size.trim();
            modalConfirmBtn.disabled = false;
          });

          sizeContainer.appendChild(sizeBtn);
        });
      } else {
        sizeContainer.innerHTML = "<p>Sản phẩm này không có tùy chọn size.</p>";
        selectedSize = "One Size";
        modalConfirmBtn.disabled = false;
      }

      modalOverlay.classList.add("active");
  }

  // ===== SỬA LỖI CHÍNH: LẮNG NGHE CLICK TRÊN DANH SÁCH CHA =====
  if (productListContainer) {
    productListContainer.addEventListener("click", (event) => {
      // Kiểm tra xem cái thứ vừa bấm vào có phải là nút "add-to-cart-btn" không
      const btn = event.target.closest(".add-to-cart-btn");
      
      if (btn) {
        event.preventDefault();
        openSizeModal(btn);
      }
    });
  } else {
    // Dự phòng cho trang chủ (nếu ID khác) hoặc trường hợp không tìm thấy container
    // Vẫn giữ cách cũ để đảm bảo tương thích
    const buttons = document.querySelectorAll(".add-to-cart-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openSizeModal(e.target);
        });
    });
  }

  // ===== NÚT "XÁC NHẬN THÊM" TRONG MODAL =====
  modalConfirmBtn.addEventListener("click", () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size sản phẩm!");
      return;
    }

    // Kiểm tra lại đăng nhập
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("⚠️ Vui lòng đăng nhập để hoàn tất thao tác!");
      window.location.href = "login.html";
      return;
    }

    const productToAdd = {
      ...currentProductData,
      size: selectedSize,
      quantity: 1, // Mặc định là 1
      uniqueId: currentProductData.id + "-" + selectedSize,
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.uniqueId === productToAdd.uniqueId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(productToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    if (typeof updateCartCounter === "function") updateCartCounter();
    if (typeof syncCartToActiveOrder === "function") syncCartToActiveOrder(cart);

    alert(`✅ Đã thêm "${productToAdd.name}" vào giỏ hàng!`);
    closeModal();
  });

  function closeModal() {
    modalOverlay.classList.remove("active");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
  });
});