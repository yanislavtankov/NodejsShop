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
// const promise_1 = __importDefault(require("mysql2/promise"));
// const fs_1 = __importDefault(require("fs"));
// const path_1 = __importDefault(require("path"));
// const tryConnect = (user, password) => __awaiter(void 0, void 0, void 0, function* () {
//     try {
//         const connection = yield promise_1.default.createConnection({
//             host: 'localhost',
//             user: user,
//             password: password
//         });
//         return connection;
//     }
//     catch (err) {
//         return null;
//     }
// });
// const setup = () => __awaiter(void 0, void 0, void 0, function* () {
//     try {
//         let connection;
//         const configs = [
//             { user: 'root', password: '' },
//             { user: 'root', password: 'root' },
//             { user: 'root', password: 'password' },
//             { user: 'root', password: 'admin' },
//             { user: 'minishop', password: '123' }
//         ];
//         let usedConfig = null;
//         for (const config of configs) {
//             console.log(`Trying connection with user: "${config.user}" and password: "${config.password}"...`);
//             connection = yield tryConnect(config.user, config.password);
//             if (connection) {
//                 usedConfig = config;
//                 console.log('Connected to MySQL successfully.');
//                 break;
//             }
//         }
//         if (!connection || !usedConfig) {
//             console.error('Could not connect to MySQL with common credentials.');
//             process.exit(1);
//         }
//         // If connected as root, try to create DB and User
//         if (usedConfig.user === 'root') {
//             // Create database
//             yield connection.query('CREATE DATABASE IF NOT EXISTS minishop');
//             console.log('Database minishop created or already exists.');
//             // Create user and grant privileges
//             try {
//                 yield connection.query("CREATE USER IF NOT EXISTS 'minishop'@'localhost' IDENTIFIED BY '123'");
//                 yield connection.query("GRANT ALL PRIVILEGES ON minishop.* TO 'minishop'@'localhost'");
//                 yield connection.query("FLUSH PRIVILEGES");
//                 console.log("User 'minishop' created/updated and privileges granted.");
//             }
//             catch (e) {
//                 console.log("Note: Could not create user or grant privileges. Proceeding...");
//             }
//         }
//         else {
//             console.log('Connected as non-root user, skipping DB/User creation steps (assuming they exist).');
//         }
//         // Switch to minishop
//         yield connection.changeUser({ database: 'minishop' });
//         // Read schema.sql
//         const schemaPath = path_1.default.join(__dirname, '../schema.sql');
//         const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
//         const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
//         for (const stmt of statements) {
//             yield connection.query(stmt);
//         }
//         console.log('Schema applied.');
//         yield connection.end();
//         process.exit(0);
//     }
//     catch (error) {
//         console.error('Setup failed:', error);
//         process.exit(1);
//     }
// });
// setup();
