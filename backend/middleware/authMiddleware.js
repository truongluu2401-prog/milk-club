
const jwt = require("jsonwebtoken");

// Kiểm tra người dùng đã đăng nhập
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Bạn cần đăng nhập để tiếp tục",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Chưa cấu hình JWT_SECRET");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
    });
  }
}

// Chỉ cho phép người bán
function requireSeller(req, res, next) {
  if (req.user?.role !== "seller") {
    return res.status(403).json({
      message: "Chỉ người bán mới được sử dụng chức năng này",
    });
  }

  next();
}

module.exports = {
  verifyToken,
  requireSeller,
};
