// "use strict";
// var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
//     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
//     return new (P || (P = Promise))(function (resolve, reject) {
//         function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
//         function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
//         function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
//         step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
// };
// var __importDefault = (this && this.__importDefault) || function (mod) {
//     return (mod && mod.__esModule) ? mod : { "default": mod };
// };
// Object.defineProperty(exports, "__esModule", { value: true });
// const express_1 = __importDefault(require("express"));
// const db_1 = __importDefault(require("../db"));
// const router = express_1.default.Router();
// const ADMIN_USER = 'admin';
// const ADMIN_PASS = 'changeme';
// // Auth Middleware
// const requireAuth = (req, res, next) => {
//     const authCookie = req.cookies.admin_auth;
//     if (authCookie === 'true') {
//         next();
//     }
//     else {
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// };
// // POST /api/admin/login
// router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     if (username === ADMIN_USER && password === ADMIN_PASS) {
//         res.cookie('admin_auth', 'true', { httpOnly: true });
//         res.json({ ok: true });
//     }
//     else {
//         res.status(401).json({ error: 'Invalid credentials' });
//     }
// });
// // POST /api/admin/logout
// router.post('/logout', (req, res) => {
//     res.clearCookie('admin_auth');
//     res.json({ ok: true });
// });
// // POST /api/admin/categories
// router.post('/categories', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     const { name, slug, parent_id } = req.body;
//     try {
//         yield db_1.default.query('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)', [name, slug, parent_id || null]);
//         res.json({ ok: true });
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// // POST /api/admin/products
// router.post('/products', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     const { title, slug, description, price, stock, category_id, image_url, is_featured } = req.body;
//     try {
//         yield db_1.default.query('INSERT INTO products (title, slug, description, price, stock, category_id, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, slug, description, price, stock, category_id, image_url, is_featured ? 1 : 0]);
//         res.json({ ok: true });
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// // PATCH /api/admin/products/:id
// router.patch('/products/:id', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     const { title, slug, description, price, stock, category_id, image_url, is_featured } = req.body;
//     try {
//         yield db_1.default.query('UPDATE products SET title=?, slug=?, description=?, price=?, stock=?, category_id=?, image_url=?, is_featured=? WHERE id=?', [title, slug, description, price, stock, category_id, image_url, is_featured ? 1 : 0, req.params.id]);
//         res.json({ ok: true });
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// // DELETE /api/admin/products/:id
// router.delete('/products/:id', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     try {
//         yield db_1.default.query('DELETE FROM products WHERE id = ?', [req.params.id]);
//         res.json({ ok: true });
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// // GET /api/admin/orders
// router.get('/orders', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     try {
//         const [rows] = yield db_1.default.query('SELECT * FROM orders ORDER BY created_at DESC');
//         res.json(rows);
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// // PATCH /api/admin/orders/:id/status
// router.patch('/orders/:id/status', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
//     const { status } = req.body;
//     try {
//         yield db_1.default.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
//         res.json({ ok: true });
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Database error' });
//     }
// }));
// exports.default = router;
