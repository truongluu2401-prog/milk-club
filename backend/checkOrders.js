
require("dotenv").config();

const pool = require("./db");

async function checkOrders() {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    console.table(result.rows);
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    await pool.end();
  }
}

checkOrders();
