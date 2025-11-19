import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const tryConnect = async (user: string, password: string) => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: user,
            password: password
        });
        return connection;
    } catch (err) {
        return null;
    }
};

const setup = async () => {
    try {
        let connection;
        const configs = [
            { user: 'root', password: '' },
            { user: 'root', password: 'root' },
            { user: 'root', password: 'password' },
            { user: 'root', password: 'admin' },
            { user: 'minishop', password: '123' }
        ];
        let usedConfig = null;

        for (const config of configs) {
            console.log(`Trying connection with user: "${config.user}" and password: "${config.password}"...`);
            connection = await tryConnect(config.user, config.password);
            if (connection) {
                usedConfig = config;
                console.log('Connected to MySQL successfully.');
                break;
            }
        }

        if (!connection || !usedConfig) {
            console.error('Could not connect to MySQL with common credentials.');
            process.exit(1);
        }

        // If connected as root, try to create DB and User
        if (usedConfig.user === 'root') {
            // Create database
            await connection.query('CREATE DATABASE IF NOT EXISTS minishop');
            console.log('Database minishop created or already exists.');

            // Create user and grant privileges
            try {
                await connection.query("CREATE USER IF NOT EXISTS 'minishop'@'localhost' IDENTIFIED BY '123'");
                await connection.query("GRANT ALL PRIVILEGES ON minishop.* TO 'minishop'@'localhost'");
                await connection.query("FLUSH PRIVILEGES");
                console.log("User 'minishop' created/updated and privileges granted.");
            } catch (e) {
                console.log("Note: Could not create user or grant privileges. Proceeding...");
            }
        } else {
            console.log('Connected as non-root user, skipping DB/User creation steps (assuming they exist).');
        }

        // Switch to minishop
        await connection.changeUser({ database: 'minishop' });

        // Read schema.sql
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const stmt of statements) {
            await connection.query(stmt);
        }
        console.log('Schema applied.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
};

setup();
