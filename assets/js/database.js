const products = [
  {
    id: "SP001",
    name: "Áo thun basic Form Nữ màu cổ điển",
    price: 199000,
    description: "100% làm từ vải cotton, nữ tính và nhẹ nhàng. Phù hợp cho mọi hoạt động hàng ngày, dễ dàng phối đồ.",
    image: "https://product.hstatic.net/1000184601/product/women_nau-nhat__2__47206564af004145addea15a2b71c162_2048x2048.jpg",
    availableSizes: ["S", "M", "L", "XL"]
  },
  {
    id: "SP002",
    name: "Áo thun Basic Nam mẫu Typo",
    price: 249000,
    description: "Áo làm từ vải cotton, mang lại cảm giác mềm mại và đầy năng động. Thiết kế typo trẻ trung, hiện đại.",
    image: "https://product.hstatic.net/1000184601/product/men_vang-sundress__5__a2dca065fd0547209ea90ecf86ff9782_2048x2048.jpg",
    availableSizes: ["M", "L", "XL"]
  },
  {
    id: "SP003",
    name: "Áo Sweaeter nỉ",
    price: 299000,
    description: "Chất vải cao cấp với kết cấu mịn hai mặt, mang lại cảm giác êm ái. Mũ trùm đầu được thiết kế để giữ form đẹp.",
    image: "https://im.uniqlo.com/global-cms/spa/res9d7c31ab934101f35172e2a6d1ae6c3dfr.jpg",
    availableSizes: ["S", "M", "L"]
  },
  {
    id: "SP004",
    name: "Áo len nữ",
    price: 349000,
    description: "Cảm giác trơn mịn được làm hoàn toàn từ chất len Merino siêu mịn. Một chiếc áo len cao cấp, tinh tế.",
    image: "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481408/item/vngoods_69_481408_3x4.jpg?width=369",
    availableSizes: ["S", "M"]
  },
  {
    id: "SP005",
    name: "Áo sơ mi Nam vải Broadcloth",
    price: 399000,
    description: "Được giặt trước để tạo nên bề mặt mềm mại. Bông được nuôi trồng theo phương pháp bền vững.",
    image: "https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315862849_org.jpg",
    availableSizes: ["S", "M", "L", "XL"]
  },
  {
    id: "SP006",
    name: "Jeans Baggy",
    price: 449000,
    description: "Chất liệu Raw denim (100% cotton) cùng form baggy loose fit, thoải mái và cá tính.",
    image: "https://content.pancake.vn/1/s2288x2860/88/d3/98/05/f32daa82a82f8cf47c9256f5303cc907852f6f2ad97b0d84cc1e7464-w:2400-h:3000-l:875966-t:image/jpeg.jpeg",
    availableSizes: ["28", "29", "30", "31", "32"]
  },
  {
    id: "SP007",
    name: "Áo Sơ Mi Cổ Thường Tay Ngắn Vải Cool Touch",
    price: 499000,
    description: "Sản phẩm sử dụng chất liệu tạo cảm giác mát mẻ khi chạm vào, thích hợp cho mùa hè.",
    image: "https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315946945_org_1.jpg",
    availableSizes: ["M", "L", "XL"]
  },
  {
    id: "SP008",
    name: "Jeans Baggy Short",
    price: 549000,
    description: "Một thiết kế năng động dành cho các khách hàng trẻ trung và đầy cá tính. Dễ dàng phối với áo thun hoặc sơ mi.",
    image: "https://content.pancake.vn/1/s700x875/23/77/e2/f4/5fa6d0958119c7d9a0e7243849ae0c54876ee93d5339d1d6ed0b491d-w:2400-h:3000-l:897588-t:image/jpeg.jpeg",
    availableSizes: ["28", "29", "30", "31"]
  },
  {
    id: "SP009",
    name: "Áo khoác Bomber",
    price: 599000,
    description: "Chất liệu Da Simili giả da cá sấu, mạnh mẽ và trẻ trung. Chống nước nhẹ.",
    image: "https://dosi-in.com/file/detailed/369/dosiin-mlb-mlb-ao-khoac-bomber-waffen-premium-padded-369992369992.jpg?w=320&h=320&fit=fill&fm=webp",
    availableSizes: ["M", "L"]
  },
  {
    id: "SP010",
    name: "Áo khoác chần bông lai công nghệ Cold.Dry (Nam)",
    price: 649000,
    description: "Áo khoác chất bông giúp giữ ấm, chống tia UV, thanh lịch và nam tính.",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2a2e875733534a7390db0ee2815f4e2f_9366/ao-khoac-chan-bong-lai-cong-nghe-cold.rdy-danh-cho-nam.jpg",
    availableSizes: ["M", "L", "XL"]
  },
  {
    id: "SP011",
    name: "Quần thể thao nữ",
    price: 699000,
    description: "Quần short 2 trong 1 thông thoáng và thoải mái, rất thích hợp cho một buổi tập luyện.",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/d798d656cac14a67a1153cd486f26ce1_9366/quan-short-2-trong-1-climacool-own-the-run.jpg",
    availableSizes: ["S", "M", "L", "XL"]
  },
  {
    id: "SP012",
    name: "Quần thể thao nam dài",
    price: 749000,
    description: "Năng động và cá tính, trẻ trung và hợp thời đại. Chất liệu co giãn 4 chiều.",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2a7478515757479d9f10cfb79b24c367_9366/quan-track-pant-dang-rong-cutline.jpg",
    availableSizes: ["S", "M", "L"]
  }
];