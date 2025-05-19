const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
   port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config).connect();
module.exports = poolPromise;
