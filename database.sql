-- ================================================================
--  ProTech Store — Database Schema + Seed Data
--  Chạy file này trong MySQL Workbench hoặc terminal:
--  mysql -u root -p < database.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS protech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE protech;

-- ----------------------------------------------------------------
--  BẢNG PRODUCTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              VARCHAR(20)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    price           BIGINT          NOT NULL,
    discount_percent TINYINT        NOT NULL DEFAULT 0,
    brand           VARCHAR(100)    NOT NULL,
    category        VARCHAR(50)     NOT NULL,
    sku             VARCHAR(100),
    stock_status    VARCHAR(50)     NOT NULL DEFAULT 'Còn hàng',
    rating          DECIMAL(2,1)    NOT NULL DEFAULT 0,
    review_count    INT             NOT NULL DEFAULT 0,
    image           VARCHAR(255),
    description     TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
--  BẢNG PRODUCT_GALLERY (ảnh phụ)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_gallery (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    product_id  VARCHAR(20)     NOT NULL,
    image_url   VARCHAR(255)    NOT NULL,
    sort_order  TINYINT         NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
--  BẢNG PRODUCT_ATTRIBUTES (thuộc tính kỹ thuật)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_attributes (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    product_id  VARCHAR(20)     NOT NULL,
    attr_key    VARCHAR(50)     NOT NULL,
    attr_value  VARCHAR(100)    NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
--  BẢNG USERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(255),
    phone       VARCHAR(20),
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
--  BẢNG ORDERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    total_amount    BIGINT          NOT NULL,
    status          VARCHAR(50)     NOT NULL DEFAULT 'pending',
    shipping_address TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
--  BẢNG ORDER_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    order_id    INT             NOT NULL,
    product_id  VARCHAR(20)     NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,
    unit_price  BIGINT          NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ================================================================
--  SEED DATA — 14 sản phẩm từ data.js
-- ================================================================

INSERT INTO products (id, name, price, discount_percent, brand, category, sku, stock_status, rating, review_count, image, description) VALUES
('cpu1', 'Intel Core i5-13400F', 5490000, 5, 'Intel', 'cpu', 'BX8071513400F', 'Còn hàng', 4.5, 28,
 'img/product/Intel Core i5-13400F.jpg',
 '<h4>Hiệu năng vượt trội cho Gaming và Sáng tạo</h4><p>Intel Core i5-13400F là sự lựa chọn vàng trong phân khúc tầm trung.</p><ul><li><strong>Socket:</strong> LGA 1700</li><li><strong>Số nhân / luồng:</strong> 10 nhân / 16 luồng</li><li><strong>Tốc độ Turbo tối đa:</strong> 4.6 GHz</li></ul>'),

('cpu2', 'Intel Core i7-13700K', 10590000, 10, 'Intel', 'cpu', 'BX8071513700K', 'Còn hàng', 5.0, 42,
 'img/product/Intel Core i7-13700K.jpg',
 '<h4>Sức mạnh tối thượng cho Game thủ và Chuyên gia</h4><p>Với 16 nhân và 24 luồng, Core i7-13700K không chỉ là một con quái vật gaming.</p><ul><li><strong>Socket:</strong> LGA 1700</li><li><strong>Số nhân / luồng:</strong> 16 nhân / 24 luồng</li><li><strong>Tốc độ Turbo tối đa:</strong> 5.4 GHz</li></ul>'),

('cpu3', 'AMD Ryzen 5 7600X', 6200000, 8, 'AMD', 'cpu', '100-100000593WOF', 'Còn hàng', 4.5, 35,
 'img/product/AMD Ryzen 5 7600X.jpg',
 '<h4>Hiệu năng Gaming thuần túy trên nền tảng mới</h4><p>AMD Ryzen 5 7600X xây dựng trên kiến trúc Zen 4 mạnh mẽ.</p><ul><li><strong>Socket:</strong> AM5</li><li><strong>Số nhân / luồng:</strong> 6 nhân / 12 luồng</li><li><strong>Tốc độ Boost tối đa:</strong> 5.3 GHz</li></ul>'),

('cpu4', 'AMD Ryzen 9 7950X', 15500000, 0, 'AMD', 'cpu', '100-100000514WOF', 'Hết hàng', 5.0, 18,
 'img/product/AMD Ryzen 9 7950X.jpg',
 '<h4>Nhà vô địch về hiệu năng đa luồng</h4><p>16 nhân 32 luồng, dễ dàng cân mọi tác vụ nặng nhất.</p><ul><li><strong>Socket:</strong> AM5</li><li><strong>Số nhân / luồng:</strong> 16 nhân / 32 luồng</li><li><strong>Tốc độ Boost tối đa:</strong> 5.7 GHz</li></ul>'),

('mb1', 'ASUS PRIME B760M-A WIFI D4', 4190000, 5, 'ASUS', 'mainboard', 'PRIME-B760M-A-WIFI-D4', 'Còn hàng', 4.0, 22,
 'img/product/ASUS PRIME B760M-A WIFI D4.jpg',
 '<h4>Nền tảng ổn định, kết nối toàn diện</h4><p>Hỗ trợ CPU Intel thế hệ 12 & 13, RAM DDR4, tích hợp Wi-Fi 6.</p><ul><li><strong>Socket:</strong> LGA 1700</li><li><strong>Chipset:</strong> B760</li><li><strong>Hỗ trợ RAM:</strong> DDR4</li></ul>'),

('mb2', 'GIGABYTE Z790 AORUS ELITE AX', 7190000, 0, 'Gigabyte', 'mainboard', 'Z790-AORUS-ELITE-AX', 'Còn hàng', 5.0, 15,
 'img/product/GIGABYTE Z790 AORUS ELITE AX.jpg',
 '<h4>Sẵn sàng cho Ép xung và Hiệu năng đỉnh cao</h4><p>Bo mạch chủ cao cấp cho CPU Intel dòng K.</p><ul><li><strong>Socket:</strong> LGA 1700</li><li><strong>Chipset:</strong> Z790</li><li><strong>Hỗ trợ RAM:</strong> DDR5</li></ul>'),

('mb3', 'ASUS TUF GAMING B650-PLUS', 5590000, 7, 'ASUS', 'mainboard', 'TUF-GAMING-B650-PLUS', 'Còn hàng', 4.5, 9,
 'img/product/ASUS TUF GAMING B650-PLUS.jpg',
 '<h4>Bền bỉ chuẩn quân đội cho nền tảng AMD</h4><p>Dành cho CPU AMD Ryzen 7000 series.</p><ul><li><strong>Socket:</strong> AM5</li><li><strong>Chipset:</strong> B650</li><li><strong>Hỗ trợ RAM:</strong> DDR5</li></ul>'),

('ram1', 'Corsair Vengeance 16GB Bus 3200', 1150000, 12, 'Corsair', 'ram', 'CMK16GX4M2B3200C16', 'Còn hàng', 5.0, 112,
 'img/product/Corsair Vengeance 16GB Bus 3200.jpg',
 '<h4>Đáng tin cậy và hiệu quả</h4><p>Kit RAM DDR4 16GB (2x8GB) tốc độ 3200MHz.</p><ul><li><strong>Loại RAM:</strong> DDR4</li><li><strong>Dung lượng:</strong> 16GB (2x8GB)</li><li><strong>Tốc độ Bus:</strong> 3200MHz</li></ul>'),

('ram2', 'G.Skill Trident Z5 32GB Bus 6000', 3250000, 0, 'G.Skill', 'ram', 'F5-6000J3636F16GX2-TZ5K', 'Còn hàng', 5.0, 56,
 'img/product/G.Skill Trident Z5 32GB Bus 6000.jpg',
 '<h4>Hiệu năng đỉnh cao và thiết kế ấn tượng</h4><p>RAM DDR5 cao cấp tốc độ 6000MHz.</p><ul><li><strong>Loại RAM:</strong> DDR5</li><li><strong>Dung lượng:</strong> 32GB (2x16GB)</li><li><strong>Tốc độ Bus:</strong> 6000MHz</li></ul>'),

('vga1', 'GIGABYTE RTX 3060 12GB', 8290000, 10, 'Gigabyte', 'vga', 'GV-N3060GAMING-OC-12GD', 'Còn hàng', 4.5, 88,
 'img/product/GIGABYTE RTX 3060 12GB.jpg',
 '<h4>Nhà vô địch Gaming Full HD</h4><p>RTX 3060 12GB VRAM, hoàn hảo cho 1080p.</p><ul><li><strong>GPU:</strong> NVIDIA GeForce RTX 3060</li><li><strong>VRAM:</strong> 12GB GDDR6</li></ul>'),

('vga2', 'ASUS TUF RTX 4070 Ti 12GB', 22490000, 5, 'ASUS', 'vga', 'TUF-RTX4070TI-O12G-GAMING', 'Còn hàng', 5.0, 31,
 'img/product/ASUS TUF RTX 4070 Ti 12GB.jpg',
 '<h4>Trải nghiệm Gaming 2K Max Setting</h4><p>Kiến trúc Ada Lovelace, DLSS 3 thế hệ mới.</p><ul><li><strong>GPU:</strong> NVIDIA GeForce RTX 4070 Ti</li><li><strong>VRAM:</strong> 12GB GDDR6X</li></ul>'),

('vga3', 'MSI RTX 4090 SUPRIM X 24G', 49990000, 0, 'MSI', 'vga', 'RTX-4090-SUPRIM-X-24G', 'Hàng sắp về', 5.0, 25,
 'img/product/MSI RTX 4090 SUPRIM X 24G.jpg',
 '<h4>Đỉnh cao đồ họa 4K</h4><p>Card đồ họa mạnh nhất thế giới, 4K Ray Tracing.</p><ul><li><strong>GPU:</strong> NVIDIA GeForce RTX 4090</li><li><strong>VRAM:</strong> 24GB GDDR6X</li></ul>'),

('psu1', 'Cooler Master MWE 650W Bronze V2', 1590000, 15, 'Cooler Master', 'psu', 'MPE-6501-ACABW-B', 'Còn hàng', 4.0, 95,
 'img/product/Cooler Master MWE 650W Bronze V2.jpg',
 '<h4>Nguồn ổn định cho hệ thống tầm trung</h4><p>650W 80 Plus Bronze, quạt HDB 120mm yên tĩnh.</p><ul><li><strong>Công suất:</strong> 650W</li><li><strong>Chuẩn:</strong> 80 Plus Bronze</li></ul>'),

('psu2', 'Corsair RM850e 850W 80 Plus Gold', 2950000, 0, 'Corsair', 'psu', 'CP-9020249-NA', 'Còn hàng', 5.0, 78,
 'img/product/Corsair RM850e 850W 80 Plus Gold.jpg',
 '<h4>Năng lượng vàng cho hệ thống cao cấp</h4><p>850W Full-Modular, 80 Plus Gold.</p><ul><li><strong>Công suất:</strong> 850W</li><li><strong>Chuẩn:</strong> 80 Plus Gold</li><li><strong>Thiết kế:</strong> Full-Modular</li></ul>');

-- ----------------------------------------------------------------
--  GALLERY
-- ----------------------------------------------------------------
INSERT INTO product_gallery (product_id, image_url, sort_order) VALUES
('cpu1','img/product/Intel Core i5-13400F.jpg',0),
('cpu1','img/product/Intel Core i5-13400F-2.jpg',1),
('cpu1','img/product/Intel Core i5-13400F-3.jpg',2),
('cpu2','img/product/Intel Core i7-13700K.jpg',0),
('cpu2','img/product/Intel Core i7-13700K-2.jpg',1),
('cpu2','img/product/Intel Core i7-13700K-3.jpg',2),
('cpu3','img/product/AMD Ryzen 5 7600X.jpg',0),
('cpu3','img/product/AMD Ryzen 5 7600X-2.jpg',1),
('cpu4','img/product/AMD Ryzen 9 7950X.jpg',0),
('cpu4','img/product/AMD Ryzen 9 7950X-2.jpg',1),
('mb1','img/product/ASUS PRIME B760M-A WIFI D4.jpg',0),
('mb2','img/product/GIGABYTE Z790 AORUS ELITE AX.jpg',0),
('mb3','img/product/ASUS TUF GAMING B650-PLUS.jpg',0),
('ram1','img/product/Corsair Vengeance 16GB Bus 3200.jpg',0),
('ram2','img/product/G.Skill Trident Z5 32GB Bus 6000.jpg',0),
('vga1','img/product/GIGABYTE RTX 3060 12GB.jpg',0),
('vga2','img/product/ASUS TUF RTX 4070 Ti 12GB.jpg',0),
('vga3','img/product/MSI RTX 4090 SUPRIM X 24G.jpg',0),
('psu1','img/product/Cooler Master MWE 650W Bronze V2.jpg',0),
('psu2','img/product/Corsair RM850e 850W 80 Plus Gold.jpg',0);

-- ----------------------------------------------------------------
--  ATTRIBUTES
-- ----------------------------------------------------------------
INSERT INTO product_attributes (product_id, attr_key, attr_value) VALUES
('cpu1','socket','LGA 1700'), ('cpu1','wattage','65'),
('cpu2','socket','LGA 1700'), ('cpu2','wattage','125'),
('cpu3','socket','AM5'),      ('cpu3','wattage','105'),
('cpu4','socket','AM5'),      ('cpu4','wattage','120'),
('mb1','socket','LGA 1700'),  ('mb1','ddr','DDR4'),
('mb2','socket','LGA 1700'),  ('mb2','ddr','DDR5'),
('mb3','socket','AM5'),       ('mb3','ddr','DDR5'),
('ram1','ddr','DDR4'),
('ram2','ddr','DDR5'),
('vga1','wattage','170'),
('vga2','wattage','285'),
('vga3','wattage','450'),
('psu1','wattage','650'),
('psu2','wattage','850');
