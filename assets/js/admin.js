// Chờ DOM tải xong
document.addEventListener('DOMContentLoaded', () => {

  // =============================================
  // 1. BẢO VỆ TRANG ADMIN
  // =============================================
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser || currentUser.email !== 'admin@clothify.com') {
    alert('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tư cách Admin.');
    window.location.href = 'login.html';
    return;
  }

  // =============================================
  // 2. CHỦ ĐỘNG XÂY DỰNG HEADER CHO ADMIN
  // =============================================
  const ctaContainer = document.querySelector('.header .cta');
  if (ctaContainer) {
    // 1. Xóa sạch mọi thứ mà script.js đã thêm
    ctaContainer.innerHTML = ''; 

    // 2. Tạo span "Xin chào"
    const adminWelcome = document.createElement('span');
    adminWelcome.style.fontWeight = '600';
    adminWelcome.style.marginRight = '10px';
    adminWelcome.textContent = `Xin chào, ${currentUser.name}!`;

    // 3. Tạo nút "Đăng xuất" MỚI
    const adminLogoutBtn = document.createElement('a');
    adminLogoutBtn.href = '#';
    adminLogoutBtn.className = 'btn ghost';
    adminLogoutBtn.id = 'logout-btn-admin'; 
    adminLogoutBtn.textContent = 'Đăng xuất';

    // 4. Thêm vào container
    ctaContainer.appendChild(adminWelcome);
    ctaContainer.appendChild(adminLogoutBtn);
  }

  // =============================================
  // 3. LOGIC ĐĂNG XUẤT (TÁCH RIÊNG CHO ADMIN)
  // =============================================
  const adminLogoutBtnElem = document.getElementById('logout-btn-admin');
  if (adminLogoutBtnElem) {
    adminLogoutBtnElem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      
      localStorage.removeItem('currentUser');
      alert('Đã đăng xuất khỏi tài khoản Admin.');
      window.location.href = 'login.html'; 
    });
  }

  // =============================================
  // 4. HIỂN THỊ DỮ LIỆU TỒN KHO (ĐÃ CẬP NHẬT)
  // =============================================
  
  // (SỬA) Đọc trực tiếp từ "cơ sở dữ liệu" localStorage
  const inventoryData = JSON.parse(localStorage.getItem('masterInventory')) || [];

  const inventoryBody = document.getElementById('inventory-list');
  if (inventoryBody) {
    let html = '';
    
    if (inventoryData.length === 0) {
      html = '<tr><td colspan="4">Không tải được dữ liệu kho. Vui lòng xóa cache và thử lại.</td></tr>';
    } else {
      inventoryData.forEach(item => {
        html += `
          <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.stock}</td>
            <!-- Thêm logic CSS cho 'Hết hàng' -->
            <td><span class="badge ${item.stock > 0 ? '' : 'danger'}">${item.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td>
          </tr>
        `;
      });
    }
    inventoryBody.innerHTML = html;
  }

  // =============================================
  // 5. HIỂN THỊ PHẢN HỒI KHÁCH HÀNG (Giữ nguyên)
  // =============================================
  const feedbackList = JSON.parse(localStorage.getItem('feedback')) || [];
  const feedbackContainer = document.getElementById('feedback-list');
  
  if (feedbackContainer) {
    if (feedbackList.length === 0) {
      feedbackContainer.innerHTML = '<p class="muted">Chưa có phản hồi nào từ khách hàng.</p>';
    } else {
      let html = '';
      // Sắp xếp feedback mới nhất lên đầu
      feedbackList.reverse().forEach(fb => {
        html += `
          <div class="feedback-item">
            <div class="feedback-header">
              <strong>${fb.name}</strong>
              <span class="muted">${fb.date}</span>
            </div>
            <div class="feedback-title">${fb.title}</div>
            <p class="muted"><em>(${fb.email})</em></p>
            <p>${fb.message}</p>
          </div>
        `;
      });
      feedbackContainer.innerHTML = html;
    }
  }

});