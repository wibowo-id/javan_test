const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'javan_test';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ensureDatabase = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.end();
};

const createTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      telepon VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      alamat TEXT NOT NULL,
      foto VARCHAR(255) DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await pool.execute(sql);
};

const connectDB = async () => {
  try {
    await ensureDatabase();
    await createTable();
    const conn = await pool.getConnection();
    conn.release();
    console.log(`MySQL connected (database: ${dbName})`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
