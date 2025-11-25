// File đơn giản hóa cho giỏ hàng
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function formatPrice(value) {
    return (value || 0).toLocaleString('vi-VN') + '₫';
  }

  function renderCart() {
    if (!tbody) return;
    
    if (!cart.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:40px;">
            Giỏ hàng của bạn đang trống.<br><br>
            <a class="btn primary" href="products.html">Tiếp tục mua sắm</a>
          </td>
        </tr>
      `;
      if (totalEl) totalEl.textContent = '0₫';
      return;
    }

    tbody.innerHTML = cart.map(item => {
      const lineTotal = item.price * item.quantity;
      return `
        <tr>
          <td>
            <div style="display:flex; gap:10px; align-items:center;">
              <img src="${item.image || ''}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
              <div>
                <div style="font-weight:600;">${item.name}</div>
                <div class="muted small">Mã: ${item.id}</div>
              </div>
            </div>
          </td>
          <td>${formatPrice(item.price)}</td>
          <td><span class="badge">${item.size || 'One size'}</span></td>
          <td>
            <div style="display:flex; gap:5px; align-items:center;">
              <button class="btn" onclick="updateQty('${item.id}', '${item.size}', -1)" style="width:30px; height:30px; padding:0;">-</button>
              <input type="number" value="${item.quantity}" min="1" max="10" 
                     onchange="updateQty('${item.id}', '${item.size}', 0, this.value)" 
                     style="width:50px; text-align:center; padding:5px; border:1px solid #ddd; border-radius:4px;">
              <button class="btn" onclick="updateQty('${item.id}', '${item.size}', 1)" style="width:30px; height:30px; padding:0;">+</button>
            </div>
          </td>
          <td>${formatPrice(lineTotal)}</td>
          <td>
            <button class="btn ghost small" onclick="removeItem('${item.id}', '${item.size}')">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  window.updateQty = function(productId, size, change, newValue) {
    const item = cart.find(i => i.id === productId && i.size === size);
    if (!item) return;
    
    if (newValue !== undefined) {
      item.quantity = Math.max(1, Math.min(10, parseInt(newValue) || 1));
    } else {
      item.quantity = Math.max(1, Math.min(10, item.quantity + change));
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCounter === 'function') updateCartCounter();
    renderCart();
  };

  window.removeItem = function(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCounter === 'function') updateCartCounter();
    renderCart();
  };

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('Vui lòng đăng nhập để thanh toán.');
        window.location.href = 'login.html';
        return;
      }
      if (!cart.length) {
        alert('Giỏ hàng đang trống.');
        return;
      }
      window.location.href = 'order-detail.html';
    });
  }

  renderCart();
});
