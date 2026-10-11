
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// API đăng ký tài khoản
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Kiểm tra dữ liệu
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !full_name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const name = full_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (name.length > 150 || normalizedEmail.length > 255) {
      return res.status(400).json({
        message: "Họ tên hoặc email quá dài",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Email không hợp lệ",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Mật khẩu phải có từ 8 đến 72 ký tự",
      });
    }

    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(password, 12);

    // Lưu tài khoản vào PostgreSQL
    // Tài khoản mới luôn có quyền buyer
    const result = await pool.query(
      `INSERT INTO users
       (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'buyer')
       RETURNING id, full_name, email, role`,
      [name, normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email này đã được đăng ký",
      });
    }

    console.error("Lỗi đăng ký:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ",
    });
  }
});

const jwt = require("jsonwebtoken");

// API đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Tìm tài khoản trong PostgreSQL
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE LOWER(email) = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const user = result.rows[0];

    // Kiểm tra mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Chưa cấu hình JWT_SECRET");
    }

    // Tạo JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ khi đăng nhập",
    });
  }
});


module.exports = router;
