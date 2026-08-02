require("dotenv").config({ quiet: true });
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const supplierRoutes = require("./routes/supplier.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const contactRoutes = require("./routes/contact.routes");
const statsRoutes = require("./routes/stats.routes");
const authMiddleware = require("./middleware/auth.middleware");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
const allowedOrigins = [
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((entry) => entry.trim()).filter(Boolean)
    : []),
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.some((entry) =>
          entry instanceof RegExp ? entry.test(origin) : entry === origin
        )
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"), {
    maxAge: "7d",
    immutable: true,
  })
);

const LOOPBACK_IPS = ["::1", "::ffff:127.0.0.1", "127.0.0.1"];

function isLocalRequest(req) {
  const ip = req.ip || req.socket?.remoteAddress || "";
  return LOOPBACK_IPS.includes(ip);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: isLocalRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: isLocalRequest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "StockFlow API is running",
    docs: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      profile: "GET /api/auth/profile",
      updateProfile: "PUT /api/auth/profile",
      changePassword: "PUT /api/auth/change-password",
      deleteAccount: "DELETE /api/auth/account",
      forgotPassword: "POST /api/auth/forgot-password",
      products: "GET /api/products (search, filters, sort, pagination)",
      product: "GET /api/products/:id",
      createProduct: "POST /api/products",
      updateProduct: "PUT /api/products/:id",
      deleteProduct: "DELETE /api/products/:id",
      uploadProductImage: "POST /api/products/:id/image (multipart 'image')",
      categories: "GET /api/categories",
      suppliers: "GET /api/suppliers",
      stockIn: "POST /api/inventory/stock-in",
      stockOut: "POST /api/inventory/stock-out",
      inventoryHistory: "GET /api/inventory/history",
      dashboard: "GET /api/dashboard",
      analytics: "GET /api/dashboard/analytics",
      reportPdf: "GET /api/reports/pdf?scope=catalog|stock-in|stock-out",
      reportCsv: "GET /api/reports/csv?scope=catalog|stock-in|stock-out",
      contact: "POST /api/contact",
      publicStats: "GET /api/stats (public landing page stats)",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", service: "stockflow-api" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/contact", authLimiter, contactRoutes);
app.use("/api/stats", apiLimiter, statsRoutes);
app.use("/api/products", apiLimiter, authMiddleware, productRoutes);
app.use("/api/categories", apiLimiter, authMiddleware, categoryRoutes);
app.use("/api/suppliers", apiLimiter, authMiddleware, supplierRoutes);
app.use("/api/inventory", apiLimiter, authMiddleware, inventoryRoutes);
app.use("/api/dashboard", apiLimiter, authMiddleware, dashboardRoutes);
app.use("/api/reports", apiLimiter, authMiddleware, reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
