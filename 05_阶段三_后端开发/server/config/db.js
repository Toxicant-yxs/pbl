// server/config/db.js - 数据库连接池
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'todo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: false
});

// 测试连接
pool.getConnection()
  .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

module.exports = pool;
