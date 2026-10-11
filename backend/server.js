
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

require("dotenv").config();

const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const {
  verifyToken,
  requireSeller,
} = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ================= CẤU HÌNH =================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Origin không được phép"));
    },
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/orders", orderRoutes);
// ================= UPLOAD ẢNH =================

// Tạo thư mục lưu ảnh nếu chưa có
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    }[file.mimetype];

    const uniqueName = crypto.randomUUID() + extension;

    cb(null, uniqueName);
  },
});

// Chỉ cho phép ảnh JPG, PNG, WEBP
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Chỉ hỗ trợ ảnh JPG, PNG và WEBP")
      );
    }

    cb(null, true);
  },
});

// Cho phép trình duyệt xem ảnh
app.use(
  "/uploads",
  express.static(uploadDir)
);

// Middleware xử lý lỗi upload
function uploadImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "Ảnh không được vượt quá 5MB"
            : err.message,
      });
    }

    next();
  });
}

// Xóa ảnh được tải lên nếu lưu dữ liệu thất bại
function removeUploadedFile(file) {
  if (!file) return;

  fs.unlink(file.path, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Lỗi xóa ảnh:", err);
    }
  });
}

// Xóa ảnh cũ trong thư mục uploads
function removeLocalImage(imageUrl) {
  if (!imageUrl) return;

  const prefix = "/uploads/";
  const index = imageUrl.indexOf(prefix);

  if (index === -1) return;

  const filename = imageUrl
    .slice(index + prefix.length)
    .split(/[?#]/)[0];

  // Chỉ xóa file nằm trực tiếp trong uploads
  if (
    !filename ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return;
  }

  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Lỗi xóa ảnh cũ:", err);
    }
  });
}

// ================= HÀM HỖ TRỢ =================

// Đổi dữ liệu PostgreSQL sang định dạng Frontend
function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: Number(p.price),
    oldPrice:
      p.old_price == null
        ? null
        : Number(p.old_price),
    image: p.image,
    stock: p.stock,
  };
}

// Kiểm tra thông tin sản phẩm
function validateProduct(body) {
  const {
    name,
    description,
    category,
    price,
    old_price,
    stock,
  } = body;

  const productPrice = Number(price);
  const productStock = Number(stock);

  const oldPrice =
    old_price === undefined ||
    old_price === null ||
    old_price === ""
      ? null
      : Number(old_price);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 255 ||
    typeof price === "undefined" ||
    price === "" ||
    !Number.isFinite(productPrice) ||
    productPrice <= 0 ||
    !Number.isInteger(productStock) ||
    productStock < 0 ||
    stock === undefined ||
    stock === "" ||
    (oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice < 0))
  ) {
    return null;
  }

  return {
    name: name.trim(),
    description: description || "",
    category: category || "Khác",
    price: productPrice,
    old_price: oldPrice,
    stock: productStock,
  };
}

function getProductId(req) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// ================= KIỂM TRA BACKEND =================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Milk.shop Backend đang hoạt động!",
  });
});

// ================= LẤY SẢN PHẨM =================

// Lấy tất cả sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id ASC"
    );

    res.json(result.rows.map(formatProduct));
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);

    res.status(500).json({
      message: "Không thể tải danh sách sản phẩm",
    });
  }
});

// Lấy chi tiết sản phẩm
app.get("/api/products/:id", async (req, res) => {
  const id = getProductId(req);

  if (!id) {
    return res.status(400).json({
      message: "ID sản phẩm không hợp lệ",
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json(formatProduct(result.rows[0]));
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);

    res.status(500).json({
      message: "Không thể tải chi tiết sản phẩm",
    });
  }
});

// ================= THÊM SẢN PHẨM =================

// Chỉ tài khoản seller được thêm sản phẩm
app.post(
  "/api/products",
  verifyToken,
  requireSeller,
  uploadImage,
  async (req, res) => {
    const product = validateProduct(req.body);

    if (!product) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    // Ảnh mới hoặc đường dẫn ảnh cũ
    const image = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : typeof req.body.image === "string"
      ? req.body.image.trim()
      : "";

    try {
      const result = await pool.query(
        `INSERT INTO products
          (name, description, category, price, old_price, image, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          product.name,
          product.description,
          product.category,
          product.price,
          product.old_price,
          image,
          product.stock,
        ]
      );

      return res.status(201).json({
        message: "Thêm sản phẩm thành công",
        product: formatProduct(result.rows[0]),
      });
    } catch (error) {
      removeUploadedFile(req.file);
      console.error("Lỗi thêm sản phẩm:", error);

      return res.status(500).json({
        message: "Không thể thêm sản phẩm",
      });
    }
  }
);

// ================= SỬA SẢN PHẨM =================

app.put(
  "/api/products/:id",
  verifyToken,
  requireSeller,
  uploadImage,
  async (req, res) => {
    const id = getProductId(req);
    const product = validateProduct(req.body);

    if (!id || !product) {
      removeUploadedFile(req.file);

      return res.status(400).json({
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    try {
      // Lấy ảnh hiện tại
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        removeUploadedFile(req.file);

        return res.status(404).json({
          message: "Không tìm thấy sản phẩm",
        });
      }

      const oldImage = existing.rows[0].image;

      const image = req.file
        ? `http://localhost:${PORT}/uploads/${req.file.filename}`
        : oldImage;

      const result = await pool.query(
        `UPDATE products
         SET name = $1,
             description = $2,
             category = $3,
             price = $4,
             old_price = $5,
             image = $6,
             stock = $7
         WHERE id = $8
         RETURNING *`,
        [
          product.name,
          product.description,
          product.category,
          product.price,
          product.old_price,
          image,
          product.stock,
          id,
        ]
      );

      // Xóa ảnh cũ sau khi cập nhật thành công
      if (req.file) {
        removeLocalImage(oldImage);
      }

      return res.json({
        message: "Cập nhật sản phẩm thành công",
        product: formatProduct(result.rows[0]),
      });
    } catch (error) {
      removeUploadedFile(req.file);
      console.error("Lỗi sửa sản phẩm:", error);

      return res.status(500).json({
        message: "Không thể cập nhật sản phẩm",
      });
    }
  }
);

// ================= XÓA SẢN PHẨM =================

app.delete(
  "/api/products/:id",
  verifyToken,
  requireSeller,
  async (req, res) => {
    const id = getProductId(req);

    if (!id) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ",
      });
    }

    try {
      const result = await pool.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy sản phẩm",
        });
      }

      removeLocalImage(result.rows[0].image);

      return res.json({
        message: "Xóa sản phẩm thành công",
      });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);

      return res.status(500).json({
        message: "Không thể xóa sản phẩm. Sản phẩm có thể đang được sử dụng trong đơn hàng.",
      });
    }
  }
);

// ================= KHỞI ĐỘNG SERVER =================

app.listen(PORT, () => {
  console.log(
    `Milk.club Backend đang chạy tại http://localhost:${PORT}`
  );
});
