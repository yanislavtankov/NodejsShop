import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'minishop',
    password: '123',
    database: 'minishop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
