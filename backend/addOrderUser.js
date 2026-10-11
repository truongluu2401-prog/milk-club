
require("dotenv").config();
const pool = require("./db");

async function main() {
  try {
    await pool.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS user_id INTEGER;
    `);

    console.log("Đã thêm cột user_id vào bảng orders!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    await pool.end();
  }
}

main();
