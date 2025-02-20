// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection(); // **Corrected: Use `pool.getConnection()`**
        console.log('Connected to the MySQL database.');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

testConnection();

module.exports = pool; 