
const express = require("express");
const pool = require("../db");

const {
  verifyToken,
  requireSeller,
} = require("../middleware/authMiddleware");

const router = express.Router();

// 1. KHÁCH HÀNG ĐẶT HÀNG
router.post("/", verifyToken, async (req, res) => {
  const { customer, items, payment = "cod" } = req.body;

  if (
    !customer ||
    !customer.name?.trim() ||
    !/^0\d{9}$/.test(customer.phone || "") ||
    !customer.address?.trim() ||
    !["cod", "bank"].includes(payment) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: "Thông tin đặt hàng không hợp lệ",
    });
  }

  const quantities = new Map();

  for (const item of items) {
    const id = Number(item.id);
    const quantity = Number(item.quantity);

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "Sản phẩm hoặc số lượng không hợp lệ",
      });
    }

    quantities.set(
      id,
      (quantities.get(id) || 0) + quantity
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ids = [...quantities.keys()].sort((a, b) => a - b);

    const result = await client.query(
      `SELECT id, name, price, stock
       FROM products
       WHERE id = ANY($1::int[])
       ORDER BY id
       FOR UPDATE`,
      [ids]
    );

    if (result.rows.length !== ids.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Có sản phẩm không tồn tại",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const product of result.rows) {
      const quantity = quantities.get(product.id);
      const price = Number(product.price);

      if (Number(product.stock) < quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `${product.name} không đủ hàng`,
        });
      }

      subtotal += price * quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price,
        quantity,
      });
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    
const saved = await client.query(
  `INSERT INTO orders (
    user_id,
    customer_name,
    phone,
    address,
    note,
    payment_method,
    payment_status,
    subtotal,
    shipping_fee,
    total_amount,
    status
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING *`,
  [
    req.user.id,
    customer.name.trim(),
    customer.phone,
    customer.address.trim(),
    customer.note || "",
    payment,
    "unpaid",
    subtotal,
    shippingFee,
    total,
    "pending",
  ]
);


    const order = saved.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name,
          quantity, price
        )
        VALUES ($1,$2,$3,$4,$5)`,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price,
        ]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Đặt hàng thành công",
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi đặt hàng:", error);

    res.status(500).json({
      message: "Không thể tạo đơn hàng",
    });
  } finally {
    client.release();
  }
});

// 2. NGƯỜI BÁN XEM DANH SÁCH ĐƠN HÀNG
router.get(
  "/",
  verifyToken,
  requireSeller,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM orders
         ORDER BY created_at DESC, id DESC`
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Không thể tải đơn hàng",
      });
    }
  }
);

/* ============ BIỂU ĐỒ DOANH THU 7 NGÀY ============ */

router.get(
  "/stats/revenue",
  verifyToken,
  requireSeller,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
          COALESCE(SUM(o.total_amount), 0) AS revenue,
          COUNT(o.id)::int AS orders
        FROM generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS days(day)
        LEFT JOIN orders o
          ON o.created_at >= days.day
          AND o.created_at < days.day + INTERVAL '1 day'
          AND o.status = 'completed'
        GROUP BY days.day
        ORDER BY days.day
      `);

      res.json(
        result.rows.map((row) => ({
          date: row.date,
          revenue: Number(row.revenue),
          orders: Number(row.orders),
        }))
      );
    } catch (error) {
      console.error("Lỗi biểu đồ doanh thu:", error);

      res.status(500).json({
        message: "Không thể tải biểu đồ doanh thu",
      });
    }
  }
);


// LỊCH SỬ MUA HÀNG CỦA KHÁCH
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        customer_name,
        phone,
        address,
        payment_method,
        payment_status,
        subtotal,
        shipping_fee,
        total_amount,
        status,
        created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy lịch sử mua hàng:", error);

    res.status(500).json({
      message: "Không thể tải lịch sử mua hàng",
    });
  }
});

// CHI TIẾT ĐƠN HÀNG CỦA KHÁCH
router.get(
  "/my-orders/:id",
  verifyToken,
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Mã đơn hàng không hợp lệ",
      });
    }

    try {
      const orderResult = await pool.query(
        `SELECT *
         FROM orders
         WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng",
        });
      }

      const itemsResult = await pool.query(
        `SELECT
          product_name,
          quantity,
          price
         FROM order_items
         WHERE order_id = $1
         ORDER BY id`,
        [id]
      );

      res.json({
        ...orderResult.rows[0],
        items: itemsResult.rows,
      });
    } catch (error) {
      console.error("Lỗi chi tiết đơn hàng:", error);

      res.status(500).json({
        message: "Không thể tải chi tiết đơn hàng",
      });
    }
  }
);

// 3. XEM CHI TIẾT ĐƠN HÀNG
router.get(
  "/:id",
  verifyToken,
  requireSeller,
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Mã đơn không hợp lệ",
      });
    }

    try {
      const order = await pool.query(
        "SELECT * FROM orders WHERE id = $1",
        [id]
      );

      if (!order.rows.length) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng",
        });
      }

      const items = await pool.query(
        `SELECT * FROM order_items
         WHERE order_id = $1
         ORDER BY id`,
        [id]
      );

      res.json({
        ...order.rows[0],
        items: items.rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Không thể tải chi tiết đơn",
      });
    }
  }
);

// 4. NGƯỜI BÁN CẬP NHẬT TRẠNG THÁI
router.patch(
  "/:id/status",
  verifyToken,
  requireSeller,
  async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Mã đơn không hợp lệ",
      });
    }

    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipping", "cancelled"],
      shipping: ["completed"],
      completed: [],
      cancelled: [],
    };

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const found = await client.query(
        "SELECT * FROM orders WHERE id = $1 FOR UPDATE",
        [id]
      );

      if (!found.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: "Không tìm thấy đơn hàng",
        });
      }

      const order = found.rows[0];

      if (!transitions[order.status]?.includes(status)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Trạng thái chuyển đổi không hợp lệ",
        });
      }

      if (status === "cancelled") {
        const items = await client.query(
          `SELECT product_id, quantity
           FROM order_items
           WHERE order_id = $1`,
          [id]
        );

        for (const item of items.rows) {
          await client.query(
            `UPDATE products
             SET stock = stock + $1
             WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }

      const updated = await client.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      await client.query("COMMIT");

      res.json({
        message: "Cập nhật trạng thái thành công",
        order: updated.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(error);

      res.status(500).json({
        message: "Không thể cập nhật đơn hàng",
      });
    } finally {
      client.release();
    }
  }
);

/* ============ THỐNG KÊ DASHBOARD ============ */

router.get(
  "/stats/dashboard",
  verifyToken,
  requireSeller,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM products) AS total_products,

          (SELECT COUNT(*) FROM orders) AS total_orders,

          (SELECT COUNT(*) FROM orders
           WHERE status = 'pending') AS pending_orders,

          (SELECT COUNT(*) FROM orders
           WHERE status = 'completed') AS completed_orders,

          (SELECT COALESCE(SUM(total_amount), 0)
           FROM orders
           WHERE status = 'completed') AS revenue,

          (SELECT COALESCE(SUM(oi.quantity), 0)
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
           WHERE o.status = 'completed') AS products_sold
      `);

      const row = result.rows[0];

      res.json({
        totalProducts: Number(row.total_products),
        totalOrders: Number(row.total_orders),
        pendingOrders: Number(row.pending_orders),
        completedOrders: Number(row.completed_orders),
        revenue: Number(row.revenue),
        productsSold: Number(row.products_sold),
      });
    } catch (error) {
      console.error("Lỗi thống kê:", error);

      res.status(500).json({
        message: "Không thể tải thống kê",
      });
    }
  }
);

module.exports = router;
