"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = express_1.default.Router();
// GET /api/categories
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM categories');
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}));
// GET /api/products
router.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q, category, featured, page = 1, limit = 10 } = req.query;
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
        const params = [];
        if (q) {
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }
        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }
        if (featured === 'true') {
            query += ' AND p.is_featured = 1';
        }
        // Pagination
        const offset = (Number(page) - 1) * Number(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        const [rows] = yield db_1.default.query(query, params);
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
}));
// GET /api/products/:slug
router.get('/products/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM products WHERE slug = ?', [req.params.slug]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}));
// POST /api/orders
router.post('/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { items, customer } = req.body;
    if (!items || items.length === 0 || !customer) {
        return res.status(400).json({ error: 'Invalid order data' });
    }
    const connection = yield db_1.default.getConnection();
    try {
        yield connection.beginTransaction();
        // Calculate total
        let total = 0;
        for (const item of items) {
            total += item.price * item.qty;
        }
        const code = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const [orderResult] = yield connection.query('INSERT INTO orders (code, total, customer_name, customer_email, customer_phone, customer_address) VALUES (?, ?, ?, ?, ?, ?)', [code, total, customer.name, customer.email, customer.phone, customer.address]);
        const orderId = orderResult.insertId;
        for (const item of items) {
            yield connection.query('INSERT INTO order_items (order_id, product_id, title_snapshot, price, qty) VALUES (?, ?, ?, ?, ?)', [orderId, item.id, item.title, item.price, item.qty]);
        }
        yield connection.commit();
        // Send Email (Mock/MailHog)
        const transporter = nodemailer_1.default.createTransport({
            host: 'localhost',
            port: 1025, // MailHog default
            secure: false,
            ignoreTLS: true
        });
        try {
            yield transporter.sendMail({
                from: '"MiniShop" <no-reply@minishop.com>',
                to: customer.email,
                subject: `Order Confirmation ${code}`,
                text: `Thank you for your order! Your order code is ${code}. Total: $${total}.`
            });
        }
        catch (emailErr) {
            console.error('Email sending failed (is MailHog running?):', emailErr);
        }
        res.json({ ok: true, code });
    }
    catch (error) {
        yield connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Order creation failed' });
    }
    finally {
        connection.release();
    }
}));
// GET /api/orders/track
router.get('/orders/track', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, email } = req.query;
    if (!code || !email) {
        return res.status(400).json({ error: 'Missing code or email' });
    }
    try {
        const [orders] = yield db_1.default.query('SELECT * FROM orders WHERE code = ? AND customer_email = ?', [code, email]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const order = orders[0];
        const [items] = yield db_1.default.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        res.json(Object.assign(Object.assign({}, order), { items }));
    }
    catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}));
exports.default = router;
