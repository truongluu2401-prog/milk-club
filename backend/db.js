
require("dotenv").config();
const { Pool } = require("pg");

const isCloud = Boolean(process.env.DATABASE_URL);

const pool = new Pool(
  isCloud
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

module.exports = pool;
