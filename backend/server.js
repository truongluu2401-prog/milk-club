
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

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

// ================= CẤU HÌNH CORS =================

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  "https://milk-club.onrender.com"
).replace(/\/$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  "https://milk-club.vercel.app",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin không được phép: " + origin)
      );
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// ================= CLOUDINARY =================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Dùng bộ nhớ tạm, không lưu ảnh vào Render
const upload = multer({
  storage: multer.memoryStorage(),

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

// Middleware nhận file ảnh
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

// Tải ảnh lên Cloudinary
function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "milk-club/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

// Lấy public_id từ URL Cloudinary do ứng dụng tạo
function getCloudinaryPublicId(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    if (url.hostname !== "res.cloudinary.com") {
      return null;
    }

    const match = url.pathname.match(
      /\/image\/upload\/(?:v\d+\/)?(milk-club\/products\/[^/]+)\.[a-zA-Z0-9]+$/
    );

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Xóa ảnh Cloudinary cũ
async function removeCloudinaryImage(imageUrl) {
  const publicId = getCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Không thể xóa ảnh Cloudinary:", error);
  }
}

// ================= HÀM HỖ TRỢ =================

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

    image: p.image
      ? p.image.replace(
          /^http:\/\/localhost:\d+(?=\/uploads\/)/,
          BACKEND_URL
        )
      : "",

    stock: p.stock,
  };
}

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
    message: "Milk.club Backend đang hoạt động!",
  });
});

// ================= LẤY SẢN PHẨM =================

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

// ================= CHI TIẾT SẢN PHẨM =================

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

app.post(
  "/api/products",
  verifyToken,
  requireSeller,
  uploadImage,
  async (req, res) => {
    const product = validateProduct(req.body);

    if (!product) {
      return res.status(400).json({
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    let uploadedImage = null;

    try {
      let image =
        typeof req.body.image === "string"
          ? req.body.image.trim()
          : "";

      // Nếu có file ảnh thì tải lên Cloudinary
      if (req.file) {
        uploadedImage = await uploadToCloudinary(req.file);
        image = uploadedImage.secure_url;
      }

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
      if (uploadedImage) {
        await removeCloudinaryImage(
          uploadedImage.secure_url
        );
      }

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
      return res.status(400).json({
        message: "Thông tin sản phẩm không hợp lệ",
      });
    }

    let uploadedImage = null;

    try {
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy sản phẩm",
        });
      }

      const oldImage = existing.rows[0].image;
      let image = oldImage;

      // Nếu chọn ảnh mới thì upload lên Cloudinary
      if (req.file) {
        uploadedImage = await uploadToCloudinary(req.file);
        image = uploadedImage.secure_url;
      }

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

      // Chỉ xóa ảnh Cloudinary cũ khi cập nhật thành công
      if (uploadedImage) {
        await removeCloudinaryImage(oldImage);
      }

      return res.json({
        message: "Cập nhật sản phẩm thành công",
        product: formatProduct(result.rows[0]),
      });
    } catch (error) {
      if (uploadedImage) {
        await removeCloudinaryImage(
          uploadedImage.secure_url
        );
      }

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

      await removeCloudinaryImage(
        result.rows[0].image
      );

      return res.json({
        message: "Xóa sản phẩm thành công",
      });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);

      return res.status(500).json({
        message:
          "Không thể xóa sản phẩm. Sản phẩm có thể đang được sử dụng trong đơn hàng.",
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
