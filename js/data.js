// js/data.js — Phiên bản kết nối MySQL qua API
// Khi chạy với backend: dữ liệu được fetch từ /api/products
// Khi chạy tĩnh (mở file trực tiếp): dùng fallback mảng cứng bên dưới

// ================================================================
//  HÀM TÍNH GIÁ KHUYẾN MÃI (dùng chung toàn bộ dự án)
// ================================================================
function calculateSalePrice(product) {
    if (!product || !product.price || !product.discountPercent || product.discountPercent <= 0) {
        return product.price;
    }
    const salePrice = product.price * (1 - product.discountPercent / 100);
    return Math.round(salePrice / 1000) * 1000;
}

// ================================================================
//  FALLBACK — dữ liệu tĩnh khi không có backend
//  (Giữ lại để trang vẫn chạy được khi mở file HTML trực tiếp)
// ================================================================
const _staticProducts = [
    { id:'cpu1',  name:'Intel Core i5-13400F',          price:5490000,  discountPercent:5,  brand:'Intel',        category:'cpu',      sku:'BX8071513400F',           stockStatus:'Còn hàng',    rating:4.5, reviewCount:28,  image:'img/product/Intel Core i5-13400F.jpg',                gallery:['img/product/Intel Core i5-13400F.jpg','img/product/Intel Core i5-13400F-2.jpg','img/product/Intel Core i5-13400F-3.jpg'], attributes:{socket:'LGA 1700',wattage:65},  description:'<h4>Hiệu năng vượt trội</h4><p>Intel Core i5-13400F tầm trung, 10 nhân 16 luồng, Turbo 4.6GHz.</p>' },
    { id:'cpu2',  name:'Intel Core i7-13700K',           price:10590000, discountPercent:10, brand:'Intel',        category:'cpu',      sku:'BX8071513700K',           stockStatus:'Còn hàng',    rating:5,   reviewCount:42,  image:'img/product/Intel Core i7-13700K.jpg',                gallery:['img/product/Intel Core i7-13700K.jpg','img/product/Intel Core i7-13700K-2.jpg'], attributes:{socket:'LGA 1700',wattage:125}, description:'<h4>Sức mạnh tối thượng</h4><p>16 nhân 24 luồng, Turbo 5.4GHz, hỗ trợ ép xung.</p>' },
    { id:'cpu3',  name:'AMD Ryzen 5 7600X',              price:6200000,  discountPercent:8,  brand:'AMD',          category:'cpu',      sku:'100-100000593WOF',        stockStatus:'Còn hàng',    rating:4.5, reviewCount:35,  image:'img/product/AMD Ryzen 5 7600X.jpg',                   gallery:['img/product/AMD Ryzen 5 7600X.jpg','img/product/AMD Ryzen 5 7600X-2.jpg'],       attributes:{socket:'AM5',wattage:105},      description:'<h4>Zen 4 Gaming</h4><p>6 nhân 12 luồng, Boost 5.3GHz, DDR5 và PCIe 5.0.</p>' },
    { id:'cpu4',  name:'AMD Ryzen 9 7950X',              price:15500000, discountPercent:0,  brand:'AMD',          category:'cpu',      sku:'100-100000514WOF',        stockStatus:'Hết hàng',    rating:5,   reviewCount:18,  image:'img/product/AMD Ryzen 9 7950X.jpg',                   gallery:['img/product/AMD Ryzen 9 7950X.jpg','img/product/AMD Ryzen 9 7950X-2.jpg'],       attributes:{socket:'AM5',wattage:120},      description:'<h4>Đa luồng đỉnh cao</h4><p>16 nhân 32 luồng, Boost 5.7GHz, 80MB cache.</p>' },
    { id:'mb1',   name:'ASUS PRIME B760M-A WIFI D4',     price:4190000,  discountPercent:5,  brand:'ASUS',         category:'mainboard',sku:'PRIME-B760M-A-WIFI-D4',   stockStatus:'Còn hàng',    rating:4,   reviewCount:22,  image:'img/product/ASUS PRIME B760M-A WIFI D4.jpg',          gallery:['img/product/ASUS PRIME B760M-A WIFI D4.jpg'],                                     attributes:{socket:'LGA 1700',ddr:'DDR4'}, description:'<h4>Nền tảng ổn định</h4><p>B760, LGA1700, DDR4, Wi-Fi 6, BT 5.2.</p>' },
    { id:'mb2',   name:'GIGABYTE Z790 AORUS ELITE AX',   price:7190000,  discountPercent:0,  brand:'Gigabyte',     category:'mainboard',sku:'Z790-AORUS-ELITE-AX',      stockStatus:'Còn hàng',    rating:5,   reviewCount:15,  image:'img/product/GIGABYTE Z790 AORUS ELITE AX.jpg',        gallery:['img/product/GIGABYTE Z790 AORUS ELITE AX.jpg'],                                   attributes:{socket:'LGA 1700',ddr:'DDR5'}, description:'<h4>Ép xung đỉnh cao</h4><p>Z790, LGA1700, DDR5, 4x M.2 Gen4.</p>' },
    { id:'mb3',   name:'ASUS TUF GAMING B650-PLUS',      price:5590000,  discountPercent:7,  brand:'ASUS',         category:'mainboard',sku:'TUF-GAMING-B650-PLUS',     stockStatus:'Còn hàng',    rating:4.5, reviewCount:9,   image:'img/product/ASUS TUF GAMING B650-PLUS.jpg',           gallery:['img/product/ASUS TUF GAMING B650-PLUS.jpg'],                                      attributes:{socket:'AM5',ddr:'DDR5'},      description:'<h4>Bền bỉ TUF</h4><p>B650, AM5, DDR5, PCIe 5.0.</p>' },
    { id:'ram1',  name:'Corsair Vengeance 16GB Bus 3200', price:1150000,  discountPercent:12, brand:'Corsair',      category:'ram',      sku:'CMK16GX4M2B3200C16',      stockStatus:'Còn hàng',    rating:5,   reviewCount:112, image:'img/product/Corsair Vengeance 16GB Bus 3200.jpg',      gallery:['img/product/Corsair Vengeance 16GB Bus 3200.jpg'],                                attributes:{ddr:'DDR4'},                   description:'<h4>DDR4 đáng tin cậy</h4><p>16GB (2x8GB), 3200MHz, tản nhiệt nhôm.</p>' },
    { id:'ram2',  name:'G.Skill Trident Z5 32GB Bus 6000',price:3250000,  discountPercent:0,  brand:'G.Skill',      category:'ram',      sku:'F5-6000J3636F16GX2-TZ5K', stockStatus:'Còn hàng',    rating:5,   reviewCount:56,  image:'img/product/G.Skill Trident Z5 32GB Bus 6000.jpg',    gallery:['img/product/G.Skill Trident Z5 32GB Bus 6000.jpg'],                               attributes:{ddr:'DDR5'},                   description:'<h4>DDR5 đỉnh cao</h4><p>32GB (2x16GB), 6000MHz, thiết kế hầm hố.</p>' },
    { id:'vga1',  name:'GIGABYTE RTX 3060 12GB',         price:8290000,  discountPercent:10, brand:'Gigabyte',     category:'vga',      sku:'GV-N3060GAMING-OC-12GD',  stockStatus:'Còn hàng',    rating:4.5, reviewCount:88,  image:'img/product/GIGABYTE RTX 3060 12GB.jpg',              gallery:['img/product/GIGABYTE RTX 3060 12GB.jpg'],                                         attributes:{wattage:170},                  description:'<h4>Gaming 1080p</h4><p>RTX 3060, 12GB GDDR6, DLSS, Ray Tracing.</p>' },
    { id:'vga2',  name:'ASUS TUF RTX 4070 Ti 12GB',      price:22490000, discountPercent:5,  brand:'ASUS',         category:'vga',      sku:'TUF-RTX4070TI-O12G-GAMING',stockStatus:'Còn hàng',    rating:5,   reviewCount:31,  image:'img/product/ASUS TUF RTX 4070 Ti 12GB.jpg',           gallery:['img/product/ASUS TUF RTX 4070 Ti 12GB.jpg'],                                      attributes:{wattage:285},                  description:'<h4>Gaming 2K Max</h4><p>RTX 4070 Ti, 12GB GDDR6X, Ada Lovelace, DLSS 3.</p>' },
    { id:'vga3',  name:'MSI RTX 4090 SUPRIM X 24G',      price:49990000, discountPercent:0,  brand:'MSI',          category:'vga',      sku:'RTX-4090-SUPRIM-X-24G',   stockStatus:'Hàng sắp về', rating:5,   reviewCount:25,  image:'img/product/MSI RTX 4090 SUPRIM X 24G.jpg',           gallery:['img/product/MSI RTX 4090 SUPRIM X 24G.jpg'],                                      attributes:{wattage:450},                  description:'<h4>Đỉnh cao 4K</h4><p>RTX 4090, 24GB GDDR6X, TRI FROZR 3S.</p>' },
    { id:'psu1',  name:'Cooler Master MWE 650W Bronze V2',price:1590000,  discountPercent:15, brand:'Cooler Master', category:'psu',     sku:'MPE-6501-ACABW-B',        stockStatus:'Còn hàng',    rating:4,   reviewCount:95,  image:'img/product/Cooler Master MWE 650W Bronze V2.jpg',     gallery:['img/product/Cooler Master MWE 650W Bronze V2.jpg'],                               attributes:{wattage:650},                  description:'<h4>Nguồn tầm trung</h4><p>650W, 80 Plus Bronze, quạt HDB 120mm.</p>' },
    { id:'psu2',  name:'Corsair RM850e 850W 80 Plus Gold',price:2950000,  discountPercent:0,  brand:'Corsair',      category:'psu',      sku:'CP-9020249-NA',           stockStatus:'Còn hàng',    rating:5,   reviewCount:78,  image:'img/product/Corsair RM850e 850W 80 Plus Gold.jpg',     gallery:['img/product/Corsair RM850e 850W 80 Plus Gold.jpg'],                               attributes:{wattage:850},                  description:'<h4>Nguồn cao cấp</h4><p>850W, 80 Plus Gold, Full-Modular.</p>' },
];

// ================================================================
//  BIẾN TOÀN CỤC — ProductController sẽ dùng sau khi load xong
// ================================================================
let allProducts = [];

// ================================================================
//  TỰ ĐỘNG PHÁT HIỆN: đang chạy với backend hay file tĩnh?
// ================================================================
(async function loadProducts() {
    // Nếu mở file trực tiếp (file://) → dùng fallback tĩnh ngay
    if (window.location.protocol === 'file:') {
        console.info('ℹ️  Chạy chế độ tĩnh (file://). Dùng dữ liệu fallback.');
        allProducts = _staticProducts;
        _onDataReady();
        return;
    }

    try {
        const res  = await fetch('/api/products');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
            allProducts = json.data;
            console.info(`✅ Đã tải ${allProducts.length} sản phẩm từ MySQL.`);
        } else {
            throw new Error('API trả về rỗng');
        }
    } catch (err) {
        console.warn('⚠️  Không thể kết nối API, dùng dữ liệu tĩnh. Lỗi:', err.message);
        allProducts = _staticProducts;
    }

    _onDataReady();
})();

// ================================================================
//  GỌI CONTROLLER SAU KHI DATA SẴN SÀNG
// (Thay thế cơ chế DOMContentLoaded + ProductController.init()
//  trong product.js – tách biệt hoàn toàn khâu load data)
// ================================================================
function _onDataReady() {
    // Phát event để product.js (và các trang khác) biết data đã sẵn sàng
    document.dispatchEvent(new CustomEvent('productsLoaded'));
}
