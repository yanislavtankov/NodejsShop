import pool from './db';

async function run() {
    try {
        const [rows] = await pool.query('DESCRIBE products');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

run();
