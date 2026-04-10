import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dns from "dns";

// Fix for Atlas connection issues on some networks (e.g. Windows dev machines)
if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Routes
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import consumableRoutes from "./routes/consumableRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

// Middleware & Utils
import globalErrorHandler from "./middleware/errorMiddleware.js";
import AppError from "./utils/appError.js";

const app = express();

// --- 1. DATABASE CONNECTION (Serverless Optimized) ---
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) return cachedDb;

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from environment variables.");
  }

  // Set global mongoose options
  mongoose.set("strictQuery", true);

  try {
    cachedDb = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    return cachedDb;
  } catch (err) {
    cachedDb = null;
    console.error("❌ Database: Connection Failed ->", err.message);
    throw err;
  }
};

// Middleware to ensure DB is connected before any API request
app.use(async (req, res, next) => {
  // Skip DB check for pure status routes
  if (req.path === "/api/health" || req.path === "/") return next();
  
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed. Ensure your MongoDB Atlas IP Whitelist allows '0.0.0.0/0'.",
      details: err.message
    });
  }
});

// --- 2. GLOBAL MIDDLEWARES ---
app.set("trust proxy", 1); 
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL 
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(compression()); // Gzip/Brotli responses — 60-80% bandwidth reduction

// Static uploads (Local Only)
if (process.env.NODE_ENV !== "production") {
  const uploadDir = "./uploads";
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  app.use("/uploads", express.static("uploads"));
}

// --- 3. MOUNT ROUTES ---

// Global rate limiter for all API routes (DDoS / abuse protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

app.get("/", (req, res) => res.send("Inventory Management System API is live!"));
app.get("/api/health", (req, res) => res.status(200).json({ status: "success", message: "Backend is running!" }));


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/consumables", consumableRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/requests", requestRoutes);
// --- 4. ERROR HANDLING ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;