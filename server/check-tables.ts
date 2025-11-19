import pool from './db';

const checkTables = async () => {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables in database:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkTables();
