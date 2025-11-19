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
// const db_1 = __importDefault(require("./db"));
// const seed = () => __awaiter(void 0, void 0, void 0, function* () {
//     try {
//         const connection = yield db_1.default.getConnection();
//         console.log('Connected to database.');
//         // Clear existing data
//         yield connection.query('SET FOREIGN_KEY_CHECKS = 0');
//         yield connection.query('TRUNCATE TABLE order_items');
//         yield connection.query('TRUNCATE TABLE orders');
//         yield connection.query('TRUNCATE TABLE products');
//         yield connection.query('TRUNCATE TABLE categories');
//         yield connection.query('SET FOREIGN_KEY_CHECKS = 1');
//         console.log('Cleared existing data.');
//         // Seed Categories
//         const categories = [
//             { name: 'Interior Doors', slug: 'interior-doors' },
//             { name: 'Exterior Doors', slug: 'exterior-doors' },
//             { name: 'Sliding Doors', slug: 'sliding-doors' },
//             { name: 'Door Handles & Accessories', slug: 'accessories' }
//         ];
//         for (const cat of categories) {
//             yield connection.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [cat.name, cat.slug]);
//         }
//         console.log('Seeded categories.');
//         // Get Category IDs
//         const [catRows] = yield connection.query('SELECT * FROM categories');
//         const catMap = new Map(catRows.map(c => [c.slug, c.id]));
//         // Seed Products
//         const products = [
//             {
//                 title: 'Classic Oak Interior Door',
//                 slug: 'classic-oak-interior',
//                 description: 'Solid oak wood door with a classic design. Perfect for bedrooms and living rooms.',
//                 price: 199.99,
//                 stock: 50,
//                 category_slug: 'interior-doors',
//                 image_url: 'https://via.placeholder.com/300?text=Classic+Oak',
//                 is_featured: true
//             },
//             {
//                 title: 'Modern White Flush Door',
//                 slug: 'modern-white-flush',
//                 description: 'Minimalist white flush door. Pre-finished and ready to hang.',
//                 price: 129.99,
//                 stock: 100,
//                 category_slug: 'interior-doors',
//                 image_url: 'https://via.placeholder.com/300?text=Modern+White',
//                 is_featured: false
//             },
//             {
//                 title: 'Heavy Duty Steel Security Door',
//                 slug: 'steel-security-door',
//                 description: 'Reinforced steel door for maximum security. Weather-resistant coating.',
//                 price: 499.99,
//                 stock: 20,
//                 category_slug: 'exterior-doors',
//                 image_url: 'https://via.placeholder.com/300?text=Steel+Security',
//                 is_featured: true
//             },
//             {
//                 title: 'Elegant Glass Patio Door',
//                 slug: 'glass-patio-door',
//                 description: 'Double glazed sliding patio door. Energy efficient and stylish.',
//                 price: 899.99,
//                 stock: 10,
//                 category_slug: 'sliding-doors',
//                 image_url: 'https://via.placeholder.com/300?text=Glass+Patio',
//                 is_featured: true
//             },
//             {
//                 title: 'Premium Brass Door Handle',
//                 slug: 'brass-door-handle',
//                 description: 'Polished brass lever handle. Includes latch and screws.',
//                 price: 39.99,
//                 stock: 200,
//                 category_slug: 'accessories',
//                 image_url: 'https://via.placeholder.com/300?text=Brass+Handle',
//                 is_featured: false
//             }
//         ];
//         for (const p of products) {
//             const catId = catMap.get(p.category_slug);
//             yield connection.query('INSERT INTO products (title, slug, description, price, stock, category_id, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [p.title, p.slug, p.description, p.price, p.stock, catId, p.image_url, p.is_featured]);
//         }
//         console.log('Seeded products.');
//         connection.release();
//         process.exit(0);
//     }
//     catch (error) {
//         console.error('Seeding failed:', error);
//         process.exit(1);
//     }
// });
// seed();
