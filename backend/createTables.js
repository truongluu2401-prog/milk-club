
require("dotenv").config();

const pool = require("./db");

async function createTables() {
  try {
    // Tạo bảng đơn hàng
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGSERIAL PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        note TEXT,
        payment_method VARCHAR(20) NOT NULL DEFAULT 'cod',
        payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
        subtotal NUMERIC(12,2) NOT NULL,
        shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_amount NUMERIC(12,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Đã tạo bảng orders thành công!");

    // Tạo bảng chi tiết đơn hàng
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGSERIAL PRIMARY KEY,
        order_id BIGINT NOT NULL
          REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL
          REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
      );
    `);

    console.log("Đã tạo bảng order_items thành công!");
    console.log("Milk.club: Tạo bảng hoàn tất!");
  } catch (error) {
    console.error("Lỗi tạo bảng:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createTables();
