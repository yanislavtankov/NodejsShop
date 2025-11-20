import express from 'express';
import pool from '../db';
import { Product, Category, Order } from '../types';
import nodemailer from 'nodemailer';
import { calculateOrderTotal } from '../utils/helpers';

const router = express.Router();

// GET /api/categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/products
router.get('/products', async (req, res) => {
    try {
        const { q, category, featured, page = 1, limit = 10 } = req.query;
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
        const params: any[] = [];

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

        if (req.query.min_price) {
            query += ' AND p.price >= ?';
            params.push(Number(req.query.min_price));
        }

        if (req.query.max_price) {
            query += ' AND p.price <= ?';
            params.push(Number(req.query.max_price));
        }

        // Pagination
        const offset = (Number(page) - 1) * Number(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/products/:slug
router.get('/products/:slug', async (req, res) => {
    try {
        const [rows] = await pool.query<Product[]>('SELECT * FROM products WHERE slug = ?', [req.params.slug]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/orders
router.post('/orders', async (req, res) => {
    const { items, customer } = req.body;

    if (!items || items.length === 0 || !customer) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Calculate total
        const total = calculateOrderTotal(items);

        const code = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const [orderResult] = await connection.query(
            'INSERT INTO orders (code, total, customer_name, customer_email, customer_phone, customer_address) VALUES (?, ?, ?, ?, ?, ?)',
            [code, total, customer.name, customer.email, customer.phone, customer.address]
        );

        const orderId = (orderResult as any).insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, title_snapshot, price, qty) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.id, item.title, item.price, item.qty]
            );
        }

        await connection.commit();

        // Send Email (Mock/MailHog)
        const transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 1025, // MailHog default
            secure: false,
            ignoreTLS: true
        });

        try {
            await transporter.sendMail({
                from: '"Врати" <no-reply@minishop.com>',
                to: customer.email,
                subject: `Order Confirmation ${code}`,
                text: `Thank you for your order! Your order code is ${code}. Total: $${total}.`
            });
        } catch (emailErr) {
            console.error('Email sending failed (is MailHog running?):', emailErr);
        }

        res.json({ ok: true, code });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Order creation failed' });
    } finally {
        connection.release();
    }
});

// GET /api/orders/track
router.get('/orders/track', async (req, res) => {
    const { code, email } = req.query;
    if (!code || !email) {
        return res.status(400).json({ error: 'Missing code or email' });
    }

    try {
        const [orders] = await pool.query<Order[]>(
            'SELECT * FROM orders WHERE code = ? AND customer_email = ?',
            [code, email]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orders[0];
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

        res.json({ ...order, items });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
