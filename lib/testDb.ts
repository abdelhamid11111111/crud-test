import mysql from 'mysql2/promise';

let testPool: mysql.Pool;

export async function setupTestDatabase() {
  testPool = mysql.createPool({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'test_notes_db',
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Create items table
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return testPool;
}

export async function cleanupTestDatabase() {
  if (testPool) {
    await testPool.query('DELETE FROM items');
  }
}

export async function closeTestDatabase() {
  if (testPool) {
    await testPool.end();
  }
}

export function getTestPool() {
  return testPool;
}