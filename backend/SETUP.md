# ProTech Store — Hướng dẫn kết nối MySQL

## Yêu cầu cài đặt
- Node.js >= 16 (https://nodejs.org)
- MySQL >= 8.0 (XAMPP, WAMP, hoặc MySQL Workbench)

---

## Bước 1 — Import database

Mở MySQL Workbench hoặc terminal, chạy:

```bash
mysql -u root -p < backend/database.sql
```

Hoặc mở MySQL Workbench → File → Run SQL Script → chọn `backend/database.sql`

---

## Bước 2 — Cấu hình kết nối

Mở file `backend/.env` và điền thông tin MySQL của bạn:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here   ← đổi thành mật khẩu MySQL của bạn
DB_NAME=protech
SERVER_PORT=3000
```

> Nếu dùng XAMPP: mật khẩu thường để trống (DB_PASSWORD=)
> Nếu dùng MySQL Workbench: dùng mật khẩu bạn đặt khi cài

---

## Bước 3 — Cài dependencies và chạy server

```bash
cd backend
npm install
node server.js
```

Kết quả mong đợi:
```
✅ Kết nối MySQL thành công!
🚀 ProTech Server đang chạy tại: http://localhost:3000
```

---

## Bước 4 — Mở trang web

Truy cập: **http://localhost:3000**

Trang web sẽ tự động:
- Fetch dữ liệu từ `/api/products` (MySQL)
- Nếu API lỗi → tự động dùng dữ liệu tĩnh fallback

---

## Các API có sẵn

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm |
| GET | `/api/products?category=cpu` | Lọc theo danh mục |
| GET | `/api/products?sort=price-asc` | Sắp xếp giá tăng dần |
| GET | `/api/products/:id` | Chi tiết 1 sản phẩm |
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/brands` | Danh sách thương hiệu |
| POST | `/api/orders` | Tạo đơn hàng mới |

### Ví dụ kết hợp query params:
```
/api/products?category=cpu&sort=price-desc
/api/products?brand=Intel,AMD&minPrice=5000000&maxPrice=15000000
```

---

## Chạy không cần backend (chế độ tĩnh)

Mở thẳng file `index.html` trong trình duyệt — trang vẫn hoạt động
bình thường với dữ liệu tĩnh fallback trong `data.js`.
