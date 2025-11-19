import express from 'express';
import pool from '../db';
import { Product } from '../types';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const router = express.Router();

// Load admin credentials from environment variables
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!ADMIN_USER || !ADMIN_PASS) {
    console.error('ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file');
    process.exit(1);
}

// Auth Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authCookie = req.cookies.admin_auth;
    if (authCookie === 'true') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        // Generate random filename with original extension
        const randomName = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        cb(null, randomName + ext);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// POST /api/admin/upload-image
router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return only the filename
    res.json({ filename: req.file.filename });
});

// POST /api/admin/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.cookie('admin_auth', 'true', { httpOnly: true });
        res.json({ ok: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_auth');
    res.json({ ok: true });
});

// POST /api/admin/categories
router.post('/categories', requireAuth, async (req, res) => {
    const { name, slug, parent_id } = req.body;
    try {
        await pool.query('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)', [name, slug, parent_id || null]);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/admin/products
router.post('/products', requireAuth, async (req, res) => {
    const { title, slug, description, price, stock, category_id, image_url, is_featured } = req.body;
    try {
        await pool.query(
            'INSERT INTO products (title, slug, description, price, stock, category_id, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, description, price, stock, category_id, image_url, is_featured ? 1 : 0]
        );
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PATCH /api/admin/products/:id
router.patch('/products/:id', requireAuth, async (req, res) => {
    const { title, slug, description, price, stock, category_id, image_url, is_featured } = req.body;
    try {
        await pool.query(
            'UPDATE products SET title=?, slug=?, description=?, price=?, stock=?, category_id=?, image_url=?, is_featured=? WHERE id=?',
            [title, slug, description, price, stock, category_id, image_url, is_featured ? 1 : 0, req.params.id]
        );
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/admin/orders
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', requireAuth, async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
