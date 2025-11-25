// ==========================================================
// DỮ LIỆU MẪU CHO ADMIN - KHỞI TẠO MỘT LẦN
// ==========================================================

function initializeAdminSampleData() {
  // 1. KHÁCH HÀNG MẪU
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const sampleCustomers = [
    {
      id: 'CUS001',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      password: '123456',
      phone: '0901234567',
      address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 ngày trước
    },
    {
      id: 'CUS002',
      name: 'Trần Thị Bình',
      email: 'tranthibinh@email.com',
      password: '123456',
      phone: '0987654321',
      address: '456 Đường XYZ, Phường 2, Quận 3, TP.HCM',
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUS003',
      name: 'Lê Văn Cường',
      email: 'levancuong@email.com',
      password: '123456',
      phone: '0912345678',
      address: '789 Đường DEF, Phường 3, Quận 5, TP.HCM',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUS004',
      name: 'Phạm Thị Dung',
      email: 'phamthidung@email.com',
      password: '123456',
      phone: '0923456789',
      address: '321 Đường GHI, Phường 4, Quận 7, TP.HCM',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'CUS005',
      name: 'Hoàng Văn Em',
      email: 'hoangvanem@email.com',
      password: '123456',
      phone: '0934567890',
      address: '654 Đường JKL, Phường 5, Quận 10, TP.HCM',
      status: 'locked',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  sampleCustomers.forEach(customer => {
    if (!users.find(u => u.email === customer.email)) {
      users.push(customer);
    }
  });
  localStorage.setItem('users', JSON.stringify(users));

  // Cập nhật bảng customers
  const customers = users
    .filter(u => u.email !== 'admin@clothify.com')
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      createdAt: u.createdAt,
      status: u.status
    }));
  localStorage.setItem('customers', JSON.stringify(customers));

  // 2. LOẠI SẢN PHẨM
  if (!localStorage.getItem('productTypes')) {
    const productTypes = [
      { id: 'PT001', name: 'Áo', description: 'Các loại áo thun, áo sơ mi, áo len', profitMargin: 25 },
      { id: 'PT002', name: 'Quần', description: 'Các loại quần jean, quần thể thao', profitMargin: 30 },
      { id: 'PT003', name: 'Áo khoác', description: 'Các loại áo khoác, jacket', profitMargin: 35 }
    ];
    localStorage.setItem('productTypes', JSON.stringify(productTypes));
  }

  // 3. SẢN PHẨM VỚI GIÁ VỐN VÀ GIÁ BÁN
  if (!localStorage.getItem('productCatalog')) {
    const catalog = [
      { 
        id: 'SP001', 
        name: 'Áo thun basic Form Nữ', 
        price: 199000, 
        costPrice: 150000,
        category: 'nu', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://product.hstatic.net/1000184601/product/women_nau-nhat__2__47206564af004145addea15a2b71c162_2048x2048.jpg',
        description: '100% làm từ vải cotton, nữ tính và nhẹ nhàng',
        availableSizes: ['S', 'M', 'L', 'XL']
      },
      { 
        id: 'SP002', 
        name: 'Áo thun Basic Nam mẫu Typo', 
        price: 249000, 
        costPrice: 180000,
        category: 'nam', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://product.hstatic.net/1000184601/product/men_vang-sundress__5__a2dca065fd0547209ea90ecf86ff9782_2048x2048.jpg',
        description: 'Áo làm từ vải cotton, mang lại cảm giác mềm mại',
        availableSizes: ['M', 'L', 'XL']
      },
      { 
        id: 'SP003', 
        name: 'Áo Sweaeter nỉ', 
        price: 299000, 
        costPrice: 220000,
        category: 'nam', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://im.uniqlo.com/global-cms/spa/res9d7c31ab934101f35172e2a6d1ae6c3dfr.jpg',
        description: 'Chất vải cao cấp với kết cấu mịn hai mặt',
        availableSizes: ['S', 'M', 'L']
      },
      { 
        id: 'SP004', 
        name: 'Áo len nữ', 
        price: 349000, 
        costPrice: 260000,
        category: 'nu', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481408/item/vngoods_69_481408_3x4.jpg?width=369',
        description: 'Cảm giác trơn mịn được làm hoàn toàn từ chất len Merino',
        availableSizes: ['S', 'M']
      },
      { 
        id: 'SP005', 
        name: 'Áo sơ mi Nam vải Broadcloth', 
        price: 399000, 
        costPrice: 300000,
        category: 'nam', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315862849_org.jpg',
        description: 'Được giặt trước để tạo nên bề mặt mềm mại',
        availableSizes: ['S', 'M', 'L', 'XL']
      },
      { 
        id: 'SP006', 
        name: 'Jeans Baggy', 
        price: 449000, 
        costPrice: 320000,
        category: 'nam', 
        typeId: 'PT002',
        status: 'active',
        image: 'https://content.pancake.vn/1/s2288x2860/88/d3/98/05/f32daa82a82f8cf47c9256f5303cc907852f6f2ad97b0d84cc1e7464-w:2400-h:3000-l:875966-t:image/jpeg.jpeg',
        description: 'Chất liệu Raw denim (100% cotton) cùng form baggy',
        availableSizes: ['28', '29', '30', '31', '32']
      },
      { 
        id: 'SP007', 
        name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', 
        price: 499000, 
        costPrice: 360000,
        category: 'nam', 
        typeId: 'PT001',
        status: 'active',
        image: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315946945_org_1.jpg',
        description: 'Sản phẩm sử dụng chất liệu tạo cảm giác mát mẻ',
        availableSizes: ['M', 'L', 'XL']
      },
      { 
        id: 'SP008', 
        name: 'Jeans Baggy Short', 
        price: 549000, 
        costPrice: 400000,
        category: 'nam', 
        typeId: 'PT002',
        status: 'active',
        image: 'https://content.pancake.vn/1/s700x875/23/77/e2/f4/5fa6d0958119c7d9a0e7243849ae0c54876ee93d5339d1d6ed0b491d-w:2400-h:3000-l:897588-t:image/jpeg.jpeg',
        description: 'Một thiết kế năng động dành cho các khách hàng trẻ trung',
        availableSizes: ['28', '29', '30', '31']
      },
      { 
        id: 'SP009', 
        name: 'Áo khoác Bomber', 
        price: 599000, 
        costPrice: 450000,
        category: 'nam', 
        typeId: 'PT003',
        status: 'active',
        image: 'https://dosi-in.com/file/detailed/369/dosiin-mlb-mlb-ao-khoac-bomber-waffen-premium-padded-369992369992.jpg?w=320&h=320&fit=fill&fm=webp',
        description: 'Chất liệu Da Simili giả da cá sấu, mạnh mẽ và trẻ trung',
        availableSizes: ['M', 'L']
      },
      { 
        id: 'SP010', 
        name: 'Áo khoác chần bông lai', 
        price: 649000, 
        costPrice: 500000,
        category: 'nam', 
        typeId: 'PT003',
        status: 'active',
        image: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2a2e875733534a7390db0ee2815f4e2f_9366/ao-khoac-chan-bong-lai-cong-nghe-cold.rdy-danh-cho-nam.jpg',
        description: 'Áo khoác chất bông giúp giữ ấm, chống tia UV',
        availableSizes: ['M', 'L', 'XL']
      },
      { 
        id: 'SP011', 
        name: 'Quần thể thao nữ', 
        price: 699000, 
        costPrice: 510000,
        category: 'nu', 
        typeId: 'PT002',
        status: 'active',
        image: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/d798d656cac14a67a1153cd486f26ce1_9366/quan-short-2-trong-1-climacool-own-the-run.jpg',
        description: 'Quần short 2 trong 1 thông thoáng và thoải mái',
        availableSizes: ['S', 'M', 'L', 'XL']
      },
      { 
        id: 'SP012', 
        name: 'Quần thể thao nam dài', 
        price: 749000, 
        costPrice: 540000,
        category: 'nam', 
        typeId: 'PT002',
        status: 'active',
        image: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2a7478515757479d9f10cfb79b24c367_9366/quan-track-pant-dang-rong-cutline.jpg',
        description: 'Năng động và cá tính, trẻ trung và hợp thời đại',
        availableSizes: ['S', 'M', 'L']
      }
    ];
    localStorage.setItem('productCatalog', JSON.stringify(catalog));
  }

  // 4. TỒN KHO
  if (!localStorage.getItem('masterInventory')) {
    const inventory = [
      { id: 'SP001', name: 'Áo thun basic Form Nữ', stock: 120, warningLevel: 20 },
      { id: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', stock: 80, warningLevel: 20 },
      { id: 'SP003', name: 'Áo Sweaeter nỉ', stock: 50, warningLevel: 15 },
      { id: 'SP004', name: 'Áo len nữ', stock: 75, warningLevel: 15 },
      { id: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', stock: 90, warningLevel: 20 },
      { id: 'SP006', name: 'Jeans Baggy', stock: 65, warningLevel: 15 },
      { id: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', stock: 40, warningLevel: 10 },
      { id: 'SP008', name: 'Jeans Baggy Short', stock: 110, warningLevel: 20 },
      { id: 'SP009', name: 'Áo khoác Bomber', stock: 30, warningLevel: 10 },
      { id: 'SP010', name: 'Áo khoác chần bông lai', stock: 45, warningLevel: 10 },
      { id: 'SP011', name: 'Quần thể thao nữ', stock: 85, warningLevel: 20 },
      { id: 'SP012', name: 'Quần thể thao nam dài', stock: 60, warningLevel: 15 }
    ];
    localStorage.setItem('masterInventory', JSON.stringify(inventory));
  }

  // 5. PHIẾU NHẬP HÀNG
  if (!localStorage.getItem('purchaseOrders')) {
    const purchaseOrders = [
      {
        id: 'PN001',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        items: [
          { productId: 'SP001', name: 'Áo thun basic Form Nữ', quantity: 50, importPrice: 100000 },
          { productId: 'SP002', name: 'Áo thun Basic Nam mẫu Typo', quantity: 30, importPrice: 120000 },
          { productId: 'SP003', name: 'Áo Sweaeter nỉ', quantity: 20, importPrice: 150000 }
        ],
        totalAmount: 50 * 100000 + 30 * 120000 + 20 * 150000,
        note: 'Nhập hàng đợt 1 - Áo thun và sweater'
      },
      {
        id: 'PN002',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        items: [
          { productId: 'SP004', name: 'Áo len nữ', quantity: 25, importPrice: 180000 },
          { productId: 'SP005', name: 'Áo sơ mi Nam vải Broadcloth', quantity: 40, importPrice: 200000 },
          { productId: 'SP006', name: 'Jeans Baggy', quantity: 35, importPrice: 250000 }
        ],
        totalAmount: 25 * 180000 + 40 * 200000 + 35 * 250000,
        note: 'Nhập hàng đợt 2 - Áo len, sơ mi và quần jean'
      },
      {
        id: 'PN003',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        items: [
          { productId: 'SP007', name: 'Áo Sơ Mi Cổ Thường Tay Ngắn', quantity: 30, importPrice: 220000 },
          { productId: 'SP008', name: 'Jeans Baggy Short', quantity: 50, importPrice: 280000 },
          { productId: 'SP009', name: 'Áo khoác Bomber', quantity: 20, importPrice: 320000 }
        ],
        totalAmount: 30 * 220000 + 50 * 280000 + 20 * 320000,
        note: 'Nhập hàng đợt 3 - Sơ mi, quần short và áo khoác'
      },
      {
        id: 'PN004',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        status: 'draft',
        items: [
          { productId: 'SP010', name: 'Áo khoác chần bông lai', quantity: 25, importPrice: 350000 },
          { productId: 'SP011', name: 'Quần thể thao nữ', quantity: 40, importPrice: 380000 },
          { productId: 'SP012', name: 'Quần thể thao nam dài', quantity: 30, importPrice: 400000 }
        ],
        totalAmount: 25 * 350000 + 40 * 380000 + 30 * 400000,
        note: 'Phiếu nháp - Áo khoác và quần thể thao'
      }
    ];
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
  }

  // 6. ĐƠN HÀNG MẪU
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  const sampleOrders = [
    {
      orderId: 'DH1704067200001',
      userEmail: 'nguyenvanan@email.com',
      customerName: 'Nguyễn Văn An',
      items: [
        {
          productId: 'SP001',
          name: 'Áo thun basic Form Nữ màu cổ điển',
          size: 'M',
          price: 199000,
          quantity: 2,
          image: 'https://product.hstatic.net/1000184601/product/women_nau-nhat__2__47206564af004145addea15a2b71c162_2048x2048.jpg',
          subtotal: 398000
        },
        {
          productId: 'SP005',
          name: 'Áo sơ mi Nam vải Broadcloth',
          size: 'L',
          price: 399000,
          quantity: 1,
          image: 'https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315862849_org.jpg',
          subtotal: 399000
        }
      ],
      total: 797000,
      status: 'da-giao',
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'nguyenvanan@email.com',
        phone: '0901234567',
        address: '123 Đường ABC, Phường 1, Quận 1, TP.HCM',
        note: 'Giao hàng giờ hành chính'
      },
      inventoryDeducted: true
    },
    {
      orderId: 'DH1704153600002',
      userEmail: 'tranthibinh@email.com',
      customerName: 'Trần Thị Bình',
      items: [
        {
          productId: 'SP003',
          name: 'Áo Sweaeter nỉ',
          size: 'M',
          price: 299000,
          quantity: 1,
          image: 'https://im.uniqlo.com/global-cms/spa/res9d7c31ab934101f35172e2a6d1ae6c3dfr.jpg',
          subtotal: 299000
        },
        {
          productId: 'SP011',
          name: 'Quần thể thao nữ',
          size: 'S',
          price: 699000,
          quantity: 1,
          image: 'https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/d798d656cac14a67a1153cd486f26ce1_9366/quan-short-2-trong-1-climacool-own-the-run.jpg',
          subtotal: 699000
        }
      ],
      total: 998000,
      status: 'dang-giao',
      paymentStatus: 'paid',
      paymentMethod: 'qr',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'tranthibinh@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Phường 2, Quận 3, TP.HCM',
        note: ''
      },
      inventoryDeducted: true
    },
    {
      orderId: 'DH1704240000003',
      userEmail: 'levancuong@email.com',
      customerName: 'Lê Văn Cường',
      items: [
        {
          productId: 'SP006',
          name: 'Jeans Baggy',
          size: '30',
          price: 449000,
          quantity: 1,
          image: 'https://content.pancake.vn/1/s2288x2860/88/d3/98/05/f32daa82a82f8cf47c9256f5303cc907852f6f2ad97b0d84cc1e7464-w:2400-h:3000-l:875966-t:image/jpeg.jpeg',
          subtotal: 449000
        },
        {
          productId: 'SP009',
          name: 'Áo khoác Bomber',
          size: 'L',
          price: 599000,
          quantity: 1,
          image: 'https://dosi-in.com/file/detailed/369/dosiin-mlb-mlb-ao-khoac-bomber-waffen-premium-padded-369992369992.jpg?w=320&h=320&fit=fill&fm=webp',
          subtotal: 599000
        }
      ],
      total: 1048000,
      status: 'cho-xac-nhan',
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'levancuong@email.com',
        phone: '0912345678',
        address: '789 Đường DEF, Phường 3, Quận 5, TP.HCM',
        note: 'Gọi trước khi giao'
      },
      inventoryDeducted: true
    },
    {
      orderId: 'DH1704326400004',
      userEmail: 'phamthidung@email.com',
      customerName: 'Phạm Thị Dung',
      items: [
        {
          productId: 'SP004',
          name: 'Áo len nữ',
          size: 'M',
          price: 349000,
          quantity: 2,
          image: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481408/item/vngoods_69_481408_3x4.jpg?width=369',
          subtotal: 698000
        }
      ],
      total: 698000,
      status: 'cho-xac-nhan',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        email: 'phamthidung@email.com',
        phone: '0923456789',
        address: '321 Đường GHI, Phường 4, Quận 7, TP.HCM',
        note: ''
      },
      inventoryDeducted: false
    }
  ];

  sampleOrders.forEach(sampleOrder => {
    if (!orders.find(o => o.orderId === sampleOrder.orderId)) {
      orders.push(sampleOrder);
    }
  });
  localStorage.setItem('orders', JSON.stringify(orders));

  // 7. SỔ CÁI TỒN KHO (LỊCH SỬ NHẬP/XUẤT)
  if (!localStorage.getItem('inventoryLedger')) {
    const ledger = [
      { 
        id: 'IMV001', 
        timestamp: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'import', 
        productId: 'SP001', 
        quantity: 50, 
        reference: 'PN001', 
        note: 'Nhập hàng đợt 1' 
      },
      { 
        id: 'IMV002', 
        timestamp: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'import', 
        productId: 'SP002', 
        quantity: 30, 
        reference: 'PN001', 
        note: 'Nhập hàng đợt 1' 
      },
      { 
        id: 'IMV003', 
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'export', 
        productId: 'SP001', 
        quantity: 5, 
        reference: 'DH1704067200001', 
        note: 'Xuất cho đơn hàng' 
      },
      { 
        id: 'IMV004', 
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'export', 
        productId: 'SP005', 
        quantity: 1, 
        reference: 'DH1704067200001', 
        note: 'Xuất cho đơn hàng' 
      },
      { 
        id: 'IMV005', 
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'export', 
        productId: 'SP003', 
        quantity: 1, 
        reference: 'DH1704153600002', 
        note: 'Xuất cho đơn hàng' 
      },
      { 
        id: 'IMV006', 
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'export', 
        productId: 'SP011', 
        quantity: 1, 
        reference: 'DH1704153600002', 
        note: 'Xuất cho đơn hàng' 
      }
    ];
    localStorage.setItem('inventoryLedger', JSON.stringify(ledger));
  }

  // 8. QUY TẮC GIÁ (TỶ LỆ LỢI NHUẬN)
  if (!localStorage.getItem('priceRules')) {
    const priceRules = [
      { id: 'PR001', productId: 'SP001', profitPercent: 25 },
      { id: 'PR002', productId: 'SP002', profitPercent: 25 },
      { id: 'PR003', productId: 'SP003', profitPercent: 25 },
      { id: 'PR004', productId: 'SP004', profitPercent: 25 },
      { id: 'PR005', productId: 'SP005', profitPercent: 25 },
      { id: 'PR006', productId: 'SP006', profitPercent: 30 },
      { id: 'PR007', productId: 'SP007', profitPercent: 25 },
      { id: 'PR008', productId: 'SP008', profitPercent: 30 },
      { id: 'PR009', productId: 'SP009', profitPercent: 35 },
      { id: 'PR010', productId: 'SP010', profitPercent: 35 },
      { id: 'PR011', productId: 'SP011', profitPercent: 30 },
      { id: 'PR012', productId: 'SP012', profitPercent: 30 }
    ];
    localStorage.setItem('priceRules', JSON.stringify(priceRules));
  }
}

