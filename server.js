// server.js — ProTech Store API Server (Railway-ready)
require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Kết nối DB ───────────────────────────────────────────────
// Railway cung cấp biến MYSQL_URL hoặc MYSQLDATABASE, MYSQLHOST, v.v.
const dbConfig = process.env.MYSQL_URL
    ? { uri: process.env.MYSQL_URL, waitForConnections: true, connectionLimit: 10 }
    : {
        host:               process.env.MYSQLHOST     || process.env.DB_HOST     || 'localhost',
        port:               process.env.MYSQLPORT     || process.env.DB_PORT     || 3306,
        user:               process.env.MYSQLUSER     || process.env.DB_USER     || 'root',
        password:           process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database:           process.env.MYSQLDATABASE || process.env.DB_NAME     || 'protech',
        waitForConnections: true,
        connectionLimit:    10,
        charset:            'utf8mb4'
    };

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(conn => { console.log('✅ MySQL connected!'); conn.release(); })
    .catch(err  => console.error('❌ MySQL error:', err.message));

// ── Helper ───────────────────────────────────────────────────
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

async function attachRelations(rows, conn) {
    if (!rows.length) return;
    const ids       = rows.map(r => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const [galleries] = await (conn || pool).query(
        `SELECT product_id, image_url FROM product_gallery WHERE product_id IN (${placeholders}) ORDER BY sort_order`, ids);
    const [attrs]    = await (conn || pool).query(
        `SELECT product_id, attr_key, attr_value FROM product_attributes WHERE product_id IN (${placeholders})`, ids);
    const gMap = {}, aMap = {};
    galleries.forEach(g => { if (!gMap[g.product_id]) gMap[g.product_id] = []; gMap[g.product_id].push(g.image_url); });
    attrs.forEach(a    => { if (!aMap[a.product_id]) aMap[a.product_id] = {}; aMap[a.product_id][a.attr_key] = a.attr_value; });
    rows.forEach(r => { r.gallery = gMap[r.id] || []; r.attributes = aMap[r.id] || {}; });
}

// ── GET /api/products ────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, sort } = req.query;
        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
        if (brand) {
            const brands = brand.split(',').map(b => b.trim().toLowerCase());
            sql += ` AND LOWER(brand) IN (${brands.map(() => '?').join(',')})`;
            params.push(...brands);
        }
        if (minPrice) { sql += ' AND price >= ?'; params.push(Number(minPrice)); }
        if (maxPrice) { sql += ' AND price <= ?'; params.push(Number(maxPrice)); }
        if (sort === 'price-asc')       sql += ' ORDER BY price ASC';
        else if (sort === 'price-desc') sql += ' ORDER BY price DESC';
        else                            sql += ' ORDER BY RAND()';

        const [rows] = await pool.query(sql, params);
        await attachRelations(rows);
        res.json({ success: true, data: rows.map(formatProduct) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/products/:id ────────────────────────────────────
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
        await attachRelations(rows);
        res.json({ success: true, data: formatProduct(rows[0]) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/brands ──────────────────────────────────────────
app.get('/api/brands', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT brand FROM products ORDER BY brand');
        res.json({ success: true, data: rows.map(r => r.brand) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/categories ──────────────────────────────────────
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/orders ─────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { items, shippingAddress, userId = null } = req.body;
        if (!items?.length) return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });

        const ids = items.map(i => i.id);
        const [products] = await conn.query(
            `SELECT id, price, discount_percent, stock_status FROM products WHERE id IN (${ids.map(()=>'?').join(',')})`, ids);

        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const p = products.find(x => x.id === item.id);
            if (!p) return res.status(400).json({ success: false, message: `Sản phẩm ${item.id} không tồn tại` });
            if (p.stock_status === 'Hết hàng') return res.status(400).json({ success: false, message: `${p.id} đã hết hàng` });
            const salePrice = Math.round(p.price * (1 - p.discount_percent / 100) / 1000) * 1000;
            totalAmount += salePrice * item.quantity;
            orderItems.push({ id: item.id, quantity: item.quantity, unitPrice: salePrice });
        }

        await conn.beginTransaction();
        const [r] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?,?,?,?)',
            [userId, totalAmount, 'pending', shippingAddress || '']);
        for (const item of orderItems) {
            await conn.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
                [r.insertId, item.id, item.quantity, item.unitPrice]);
        }
        await conn.commit();
        res.json({ success: true, message: 'Đặt hàng thành công', data: { orderId: r.insertId, totalAmount } });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
});

// ── SPA fallback ─────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
    console.log(`🚀 ProTech chạy tại cổng ${PORT}`);
});
