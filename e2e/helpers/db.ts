import mysql from 'mysql2/promise';

let connection: mysql.Connection;

export async function setupTestDB() {
  connection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'test_notes_db',
  });

  // Create table if it doesn't exist
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function cleanupTestDB() {
  if (connection) {
    await connection.execute('DELETE FROM items');
  }
}

export async function closeTestDB() {
  if (connection) {
    await connection.end();
  }
}

export async function seedTestData(items: { name: string }[]) {
  for (const item of items) {
    await connection.execute('INSERT INTO items (name) VALUES (?)', [item.name]);
  }
}

export async function getItemsFromDB() {
  const [rows] = await connection.execute('SELECT * FROM items ORDER BY created_at DESC');
  return rows;
}

export async function getItemById(id: number) {
  const [rows] = await connection.execute('SELECT * FROM items WHERE id = ?', [id]) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
  return rows[0];
}