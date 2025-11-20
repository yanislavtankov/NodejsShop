import request from 'supertest';
import express from 'express';
import apiRoutes from '../../server/routes/api';

// Mock the database pool
jest.mock('../../server/db', () => ({
    query: jest.fn(),
    getConnection: jest.fn(),
}));

import pool from '../../server/db';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/categories', () => {
        it('should return a list of categories', async () => {
            const mockCategories = [{ id: 1, name: 'Test Category', slug: 'test-category' }];
            (pool.query as jest.Mock).mockResolvedValue([mockCategories]);

            const res = await request(app).get('/api/categories');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockCategories);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM categories');
        });

        it('should handle database errors', async () => {
            (pool.query as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const res = await request(app).get('/api/categories');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /api/products', () => {
        it('should return a list of products', async () => {
            const mockProducts = [{ id: 1, title: 'Test Product', price: 100 }];
            (pool.query as jest.Mock).mockResolvedValue([mockProducts]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockProducts);
        });
    });
});
