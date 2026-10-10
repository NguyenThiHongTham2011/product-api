require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(express.json());
app.get("/health", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "unhealthy",
        database: "disconnected"
      });
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      database: "unavailable"
    });
  }
});
// Kiểm tra dữ liệu và chỉ lấy bốn trường của Product.
function getProductData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const { pid, pname, price, quantity } = body;

  if (
    typeof pid !== "string" ||
    !pid.trim() ||
    typeof pname !== "string" ||
    !pname.trim() ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    return null;
  }

  return {
    pid: pid.trim(),
    pname: pname.trim(),
    price,
    quantity
  };
}

// Trang kiểm tra API.
app.get("/", (req, res) => {
  res.json({ message: "Product API đang hoạt động" });
});

// CREATE: Thêm sản phẩm.
app.post("/api/products", async (req, res) => {
  const data = getProductData(req.body);

  if (!data) {
    return res.status(400).json({
      message: "Cần pid, pname không rỗng; price không âm; quantity nguyên không âm"
    });
  }

  const product = await Product.create(data);
  res.status(201).json(product);
});

// READ: Lấy danh sách sản phẩm.
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// READ: Tìm sản phẩm theo pid.
app.get("/api/products/:pid", async (req, res) => {
  const product = await Product.findOne({ pid: req.params.pid });

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm"
    });
  }

  res.json(product);
});

// UPDATE: Cập nhật đầy đủ thông tin sản phẩm.
app.put("/api/products/:pid", async (req, res) => {
  const data = getProductData(req.body);

  if (!data) {
    return res.status(400).json({
      message: "Thông tin sản phẩm thiếu hoặc không hợp lệ"
    });
  }

  const product = await Product.findOneAndUpdate(
    { pid: req.params.pid },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm"
    });
  }

  res.json(product);
});

// DELETE: Xóa sản phẩm theo pid.
app.delete("/api/products/:pid", async (req, res) => {
  const product = await Product.findOneAndDelete({
    pid: req.params.pid
  });

  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm"
    });
  }

  res.status(204).end();
});

// Đường dẫn không tồn tại.
app.use((req, res) => {
  res.status(404).json({ message: "Đường dẫn không tồn tại" });
});

// Xử lý lỗi.
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Mã sản phẩm đã tồn tại"
    });
  }

  if (
    err.name === "ValidationError" ||
    err.name === "CastError" ||
    err.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      message: "Dữ liệu hoặc JSON không hợp lệ"
    });
  }

  console.error(err.message);
  res.status(500).json({ message: "Lỗi máy chủ" });
});

// Kết nối MongoDB trước khi mở API.
async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error("Thiếu MONGO_URI trong file .env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  });

  // Đợi tạo index để bảo đảm pid không trùng.
  await Product.init();

  console.log("Đã kết nối MongoDB thành công");

  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`API đang chạy tại http://localhost:${port}`);
  });

  server.on("error", async (err) => {
    console.error("Không thể mở API:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  });
}

start().catch(async (err) => {
  console.error("Khởi động thất bại:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});