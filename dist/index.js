"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./routes/api"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/admin', express_1.default.static(path_1.default.join(__dirname, '../admin')));
// Routes
app.use('/api', api_1.default);
app.use('/api/admin', admin_1.default);
// Fallback for SPA-like behavior (optional, but good for specific pages if needed)
// For now, we just serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../admin/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
