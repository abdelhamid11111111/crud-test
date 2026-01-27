import mysql from 'mysql2/promise';

let pool: mysql.Pool;

// In test environment (jest), use test database credentials
// Otherwise use production database credentials
const isTestEnv = process.env.JEST_WORKER_ID !== undefined;

if (isTestEnv) {
  // Test database
  pool = mysql.createPool({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'test_notes_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  // Production database
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

export default pool;