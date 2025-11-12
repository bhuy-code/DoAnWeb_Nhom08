// ==========================================================
// CHỨC NĂNG: MODAL CHỌN SIZE + NHẬP SỐ LƯỢNG + THÊM GIỎ HÀNG
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  
  const modalOverlay = document.getElementById("size-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-add-btn");
  const allAddToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  if (!modalOverlay || !modalCloseBtn || !modalConfirmBtn) return;

  let currentProductData = {};
  let selectedSize = null;

  // ===== GẮN SỰ KIỆN CHO NÚT "THÊM VÀO GIỎ" =====
  allAddToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      // 🔒 KIỂM TRA ĐĂNG NHẬP
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("⚠️ Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
        window.location.href = "login.html"; // chuyển đến trang đăng nhập
        return; // Dừng lại, không mở modal
      }

      // --- Nếu đã đăng nhập, tiếp tục hiển thị modal ---
      const productCard = event.target.closest(".card");
      const name = productCard.querySelector(".product-name").innerText;
      const priceText = productCard.querySelector(".product-price").innerText;
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

      document.getElementById("modal-product-name").innerText = name;
      document.getElementById("modal-product-price").innerText = priceText;
      document.getElementById("modal-product-image").src = image;

      const sizeContainer = document.getElementById("modal-size-options");
      sizeContainer.innerHTML = "";
      selectedSize = null;
      modalConfirmBtn.disabled = true;

      const qtyInput = document.getElementById("modal-quantity");
      if (qtyInput) qtyInput.value = 1;

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
    });
  });

  // ===== NÚT "XÁC NHẬN THÊM" TRONG MODAL =====
  modalConfirmBtn.addEventListener("click", () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size sản phẩm!");
      return;
    }

    const quantityInput = document.getElementById("modal-quantity");
    const quantityValue = parseInt(quantityInput?.value) || 1;
    if (quantityValue <= 0) {
      alert("Số lượng phải lớn hơn 0!");
      return;
    }

    // 🔒 KIỂM TRA LẠI ĐĂNG NHẬP (phòng trường hợp mở modal sẵn)
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("⚠️ Vui lòng đăng nhập để hoàn tất thao tác!");
      window.location.href = "login.html";
      return;
    }

    const productToAdd = {
      ...currentProductData,
      size: selectedSize,
      quantity: quantityValue,
      uniqueId: currentProductData.id + "-" + selectedSize,
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(
      (item) => item.uniqueId === productToAdd.uniqueId
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantityValue;
    } else {
      cart.push(productToAdd);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    if (typeof updateCartCounter === "function") {
      updateCartCounter();
    }
    if (typeof syncCartToActiveOrder === "function") {
      syncCartToActiveOrder(cart);
    }

    alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
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
