// Danh sách tất cả sản phẩm (Mô phỏng Database)
const products = [
  {
    id: "SP001",
    name: "Áo thun basic Form Nữ màu cổ điển",
    price: 199000,
    image: "https://product.hstatic.net/1000184601/product/women_nau-nhat__2__47206564af004145addea15a2b71c162_2048x2048.jpg",
    desc: "Chất liệu cotton 100% mềm mại, thấm hút mồ hôi tốt. Form áo vừa vặn, tôn dáng người mặc."
  },
  {
    id: "SP002",
    name: "Áo thun Basic Nam mẫu Typo",
    price: 249000,
    image: "https://product.hstatic.net/1000184601/product/men_vang-sundress__5__a2dca065fd0547209ea90ecf86ff9782_2048x2048.jpg",
    desc: "Thiết kế năng động với họa tiết chữ in nổi bật. Thích hợp cho các hoạt động dã ngoại, dạo phố."
  },
  {
    id: "SP003",
    name: "Áo Sweaeter nỉ",
    price: 299000,
    image: "https://im.uniqlo.com/global-cms/spa/res9d7c31ab934101f35172e2a6d1ae6c3dfr.jpg",
    desc: "Áo nỉ ấm áp, giữ nhiệt tốt cho mùa thu đông. Màu sắc trung tính dễ phối đồ."
  },
  {
    id: "SP004",
    name: "Áo len nữ",
    price: 349000,
    image: "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/481408/item/vngoods_69_481408_3x4.jpg?width=369",
    desc: "Chất len Merino cao cấp, không gây ngứa, giữ ấm tuyệt đối."
  },
  {
    id: "SP005",
    name: "Áo sơ mi Nam vải Broadcloth",
    price: 399000,
    image: "https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315862849_org.jpg",
    desc: "Sơ mi công sở lịch lãm, vải chống nhăn nhẹ, dễ dàng ủi phẳng."
  },
  {
    id: "SP006",
    name: "Jeans Baggy",
    price: 449000,
    image: "https://content.pancake.vn/1/s2288x2860/88/d3/98/05/f32daa82a82f8cf47c9256f5303cc907852f6f2ad97b0d84cc1e7464-w:2400-h:3000-l:875966-t:image/jpeg.jpeg",
    desc: "Quần Jeans form rộng thoải mái, phong cách bụi bặm cá tính."
  },
  {
    id: "SP007",
    name: "Áo Sơ Mi Cổ Thường Tay Ngắn Vải Cool Touch",
    price: 499000,
    image: "https://api.muji.com.vn/media/catalog/product/cache/4da93324a1c25b12e9566f761e24b9c9/4/5/4547315946945_org_1.jpg",
    desc: "Công nghệ vải Cool Touch tạo cảm giác mát lạnh ngay khi chạm vào."
  },
  {
    id: "SP008",
    name: "Jeans Baggy Short",
    price: 549000,
    image: "https://content.pancake.vn/1/s700x875/23/77/e2/f4/5fa6d0958119c7d9a0e7243849ae0c54876ee93d5339d1d6ed0b491d-w:2400-h:3000-l:897588-t:image/jpeg.jpeg",
    desc: "Phiên bản quần đùi của dòng Baggy, mát mẻ cho mùa hè."
  },
   // ... Bạn có thể thêm tiếp SP009 đến SP012 tương tự ...
];