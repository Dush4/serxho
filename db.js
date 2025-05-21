const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST, 
  database: process.env.DB_NAME,
  options: {
    encrypt: false, 
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    module.exports = pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
  });
