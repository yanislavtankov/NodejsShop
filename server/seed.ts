import pool from './db';
import { Category, Product } from './types';

const seed = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Свързване с базата данни...');

        // Изчистване на съществуващите данни
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE order_items');
        await connection.query('TRUNCATE TABLE orders');
        await connection.query('TRUNCATE TABLE products');
        await connection.query('TRUNCATE TABLE categories');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Съществуващите данни са изчистени.');

        // Зареждане на категории
        const categories = [
            { name: 'Вътрешни врати', slug: 'interior-doors' },
            { name: 'Външни врати', slug: 'exterior-doors' },
            { name: 'Плъзгащи врати', slug: 'sliding-doors' },
            { name: 'Дръжки и аксесоари', slug: 'accessories' }
        ];

        for (const cat of categories) {
            await connection.query(
                'INSERT INTO categories (name, slug) VALUES (?, ?)',
                [cat.name, cat.slug]
            );
        }
        console.log('Категориите са заредени.');

        // Вземане на ID-тата на категориите
        const [catRows] = await connection.query<Category[]>('SELECT * FROM categories');
        const catMap = new Map(catRows.map(c => [c.slug, c.id]));

        // Зареждане на продукти
        const products: Array<{
            title: string;
            slug: string;
            description: string;
            price: number;
            stock: number;
            category_slug: string;
            image_url: string;
            is_featured: boolean;
        }> = [
                {
                    title: 'Класическа вътрешна врата от дъб',
                    slug: 'classic-oak-interior',
                    description: 'Плътна интериорна врата от масивен дъб с класически дизайн, подходяща за спални и дневни помещения.',
                    price: 199.99,
                    stock: 50,
                    category_slug: 'interior-doors',
                    image_url: 'https://via.placeholder.com/300?text=Classic+Oak',
                    is_featured: true
                },
                {
                    title: 'Модерна бяла флат врата',
                    slug: 'modern-white-flush',
                    description: 'Минималистична бяла интериорна врата, фабрично боядисана и готова за монтаж.',
                    price: 129.99,
                    stock: 100,
                    category_slug: 'interior-doors',
                    image_url: 'https://via.placeholder.com/300?text=Modern+White',
                    is_featured: false
                },
                {
                    title: 'Стоманена блиндирана входна врата',
                    slug: 'steel-security-door',
                    description: 'Подсилена стоманена врата за максимална сигурност с устойчиво на атмосферни влияния покритие.',
                    price: 499.99,
                    stock: 20,
                    category_slug: 'exterior-doors',
                    image_url: 'https://via.placeholder.com/300?text=Steel+Security',
                    is_featured: true
                },
                {
                    title: 'Елегантна остъклена плъзгаща врата за тераса',
                    slug: 'glass-patio-door',
                    description: 'Двукатна остъклена плъзгаща врата, енергийно ефективна и подходяща за тераси и веранди.',
                    price: 899.99,
                    stock: 10,
                    category_slug: 'sliding-doors',
                    image_url: 'https://via.placeholder.com/300?text=Glass+Patio',
                    is_featured: true
                },
                {
                    title: 'Премиум месингова дръжка за врата',
                    slug: 'brass-door-handle',
                    description: 'Полирана месингова дръжка с включени език и крепежни елементи, подходяща за интериорни врати.',
                    price: 39.99,
                    stock: 200,
                    category_slug: 'accessories',
                    image_url: 'https://via.placeholder.com/300?text=Brass+Handle',
                    is_featured: false
                }
            ];

        for (const p of products) {
            const catId = catMap.get(p.category_slug);
            await connection.query(
                'INSERT INTO products (title, slug, description, price, stock, category_id, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [p.title, p.slug, p.description, p.price, p.stock, catId, p.image_url, p.is_featured]
            );
        }
        console.log('Продуктите са заредени.');

        connection.release();
        console.log('Зареждането (seeding) е успешно завършено.');
        process.exit(0);
    } catch (error) {
        console.error('Зареждането (seeding) беше неуспешно:', error);
        process.exit(1);
    }
};

seed();
