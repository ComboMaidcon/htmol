// backend/server.js — ProTech Store API Server
// Node.js + Express + MySQL2

require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.SERVER_PORT || 3000;

// ================================================================
//  MIDDLEWARE
// ================================================================
app.use(cors());
app.use(express.json());

// Serve toàn bộ file tĩnh của trang web (HTML, CSS, JS, ảnh)
app.use(express.static(path.join(__dirname, '..')));

// ================================================================
//  KẾT NỐI DATABASE
// ================================================================
const pool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:               process.env.DB_PORT     || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'protech',
    waitForConnections: true,
    connectionLimit:    10,
    charset:            'utf8mb4'
});

// Test kết nối khi khởi động
pool.getConnection()
    .then(conn => {
        console.log('✅ Kết nối MySQL thành công!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Không thể kết nối MySQL:', err.message);
        console.error('   Hãy kiểm tra .env và đảm bảo MySQL đang chạy.');
    });

// ================================================================
//  HELPER
// ================================================================
function formatProduct(row) {
    return {
        id:              row.id,
        name:            row.name,
        price:           Number(row.price),
        discountPercent: Number(row.discount_percent),
        brand:           row.brand,
        category:        row.category,
        sku:             row.sku,
        stockStatus:     row.stock_status,
        rating:          Number(row.rating),
        reviewCount:     Number(row.review_count),
        image:           row.image,
        description:     row.description,
        gallery:         row.gallery    || [],
        attributes:      row.attributes || {}
    };
}

// ================================================================
//  API ROUTES
// ================================================================

// ── GET /api/products ─────────────────────────────────────────
// Query params: category, brand, minPrice, maxPrice, sort
// Ví dụ: /api/products?category=cpu&sort=price-asc
// ──────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, sort } = req.query;

        let sql    = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category);
        }
        if (brand) {
            const brands = brand.split(',').map(b => b.trim().toLowerCase());
            sql += ` AND LOWER(brand) IN (${brands.map(() => '?').join(',')})`;
            params.push(...brands);
        }
        if (minPrice) {
            sql += ' AND price >= ?';
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            sql += ' AND price <= ?';
            params.push(Number(maxPrice));
        }

        // Sắp xếp
        if (sort === 'price-asc')  sql += ' ORDER BY price ASC';
        else if (sort === 'price-desc') sql += ' ORDER BY price DESC';
        else sql += ' ORDER BY RAND()'; // default: ngẫu nhiên

        const [rows] = await pool.query(sql, params);

        // Lấy gallery cho từng sản phẩm
        if (rows.length > 0) {
            const ids = rows.map(r => r.id);
            const [galleries] = await pool.query(
                `SELECT product_id, image_url FROM product_gallery
                 WHERE product_id IN (${ids.map(() => '?').join(',')})
                 ORDER BY sort_order`,
                ids
            );
            const [attrs] = await pool.query(
                `SELECT product_id, attr_key, attr_value FROM product_attributes
                 WHERE product_id IN (${ids.map(() => '?').join(',')})`,
                ids
            );

            // Map gallery và attributes vào từng sản phẩm
            const galleryMap = {};
            const attrMap    = {};
            galleries.forEach(g => {
                if (!galleryMap[g.product_id]) galleryMap[g.product_id] = [];
                galleryMap[g.product_id].push(g.image_url);
            });
            attrs.forEach(a => {
                if (!attrMap[a.product_id]) attrMap[a.product_id] = {};
                attrMap[a.product_id][a.attr_key] = a.attr_value;
            });

            rows.forEach(r => {
                r.gallery    = galleryMap[r.id]    || [];
                r.attributes = attrMap[r.id]       || {};
            });
        }

        res.json({ success: true, data: rows.map(formatProduct) });

    } catch (err) {
        console.error('Lỗi GET /api/products:', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// ── GET /api/products/:id ─────────────────────────────────────
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        const product = rows[0];

        const [galleries] = await pool.query(
            'SELECT image_url FROM product_gallery WHERE product_id = ? ORDER BY sort_order',
            [id]
        );
        const [attrs] = await pool.query(
            'SELECT attr_key, attr_value FROM product_attributes WHERE product_id = ?',
            [id]
        );

        product.gallery    = galleries.map(g => g.image_url);
        product.attributes = {};
        attrs.forEach(a => { product.attributes[a.attr_key] = a.attr_value; });

        res.json({ success: true, data: formatProduct(product) });

    } catch (err) {
        console.error('Lỗi GET /api/products/:id:', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
});

// ── GET /api/categories ───────────────────────────────────────
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category'
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ── GET /api/brands ───────────────────────────────────────────
app.get('/api/brands', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT brand FROM products ORDER BY brand'
        );
        res.json({ success: true, data: rows.map(r => r.brand) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// ── POST /api/orders ──────────────────────────────────────────
// Body: { items: [{id, quantity}], shippingAddress: "..." }
app.post('/api/orders', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { items, shippingAddress, userId = null } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        // Lấy giá hiện tại từ DB (không tin giá từ client)
        const productIds = items.map(i => i.id);
        const [products] = await conn.query(
            `SELECT id, price, discount_percent, stock_status FROM products
             WHERE id IN (${productIds.map(() => '?').join(',')})`,
            productIds
        );

        // Kiểm tra tồn kho và tính tổng tiền
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.id);
            if (!product) {
                return res.status(400).json({ success: false, message: `Sản phẩm ${item.id} không tồn tại` });
            }
            if (product.stock_status === 'Hết hàng') {
                return res.status(400).json({ success: false, message: `${item.id} đã hết hàng` });
            }

            const salePrice = Math.round(product.price * (1 - product.discount_percent / 100) / 1000) * 1000;
            totalAmount += salePrice * item.quantity;
            orderItems.push({ id: item.id, quantity: item.quantity, unitPrice: salePrice });
        }

        // Tạo đơn hàng
        await conn.beginTransaction();

        const [orderResult] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)',
            [userId, totalAmount, 'pending', shippingAddress || '']
        );
        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.unitPrice]
            );
        }

        await conn.commit();

        res.json({
            success: true,
            message: 'Đặt hàng thành công',
            data: { orderId, totalAmount }
        });

    } catch (err) {
        await conn.rollback();
        console.error('Lỗi POST /api/orders:', err);
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    } finally {
        conn.release();
    }
});

// ── Tất cả route còn lại → trả về index.html (SPA fallback) ──
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ================================================================
//  START SERVER
// ================================================================
app.listen(PORT, () => {
    console.log(`\n🚀 ProTech Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📦 API sản phẩm:  http://localhost:${PORT}/api/products`);
    console.log(`📋 API chi tiết:  http://localhost:${PORT}/api/products/cpu1`);
    console.log(`\n⚠️  Đảm bảo MySQL đang chạy và đã import database.sql trước!`);
});
