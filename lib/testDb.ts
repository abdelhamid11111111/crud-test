import mysql from 'mysql2/promise';

let testPool: mysql.Pool;

export async function setupTestDatabase() {
  // First, create a connection without specifying a database to create the database
  const initialConnection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
  });

  const dbName = process.env.TEST_DB_NAME || 'test_notes_db';
  
  // Create the database if it doesn't exist
  await initialConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await initialConnection.end();

  // Now create the pool with the database specified
  testPool = mysql.createPool({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: dbName,
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