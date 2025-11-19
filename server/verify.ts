import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('Starting Verification...');

    try {
        // 1. Public API
        console.log('\n--- Public API ---');

        // Categories
        const cats = await client.get(`${BASE_URL}/api/categories`);
        console.log(`GET /api/categories: ${cats.status} ${cats.statusText}`);
        if (cats.data.length > 0) console.log(`- Found ${cats.data.length} categories`);
        else console.error('- No categories found!');

        // Products
        const prods = await client.get(`${BASE_URL}/api/products`);
        console.log(`GET /api/products: ${prods.status} ${prods.statusText}`);
        if (prods.data.length > 0) {
            console.log(`- Found ${prods.data.length} products`);
            const slug = prods.data[0].slug;

            // Single Product
            const prod = await client.get(`${BASE_URL}/api/products/${slug}`);
            console.log(`GET /api/products/${slug}: ${prod.status} ${prod.statusText}`);
        } else {
            console.error('- No products found!');
        }

        // 2. Admin API
        console.log('\n--- Admin API ---');

        // Login
        const login = await client.post(`${BASE_URL}/api/admin/login`, {
            username: 'admin',
            password: 'changeme'
        });
        console.log(`POST /api/admin/login: ${login.status} ${login.statusText}`);

        // Orders (Protected)
        const orders = await client.get(`${BASE_URL}/api/admin/orders`);
        console.log(`GET /api/admin/orders: ${orders.status} ${orders.statusText}`);

        // Create Product (Protected)
        const newProd = await client.post(`${BASE_URL}/api/admin/products`, {
            title: 'Test Product',
            slug: 'test-product-' + Date.now(),
            description: 'Test Description',
            price: 99.99,
            stock: 10,
            category_id: cats.data[0].id,
            image_url: '',
            is_featured: false
        });
        console.log(`POST /api/admin/products: ${newProd.status} ${newProd.statusText}`);

        console.log('\nVerification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.status, error.response.data);
        }
    }
}

runTests();
