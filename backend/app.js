
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

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

// --- 2. DATABASE CONNECTION (Handled in app.js) ---

// --- 3. START SERVER (LOCAL DEVELOPMENT ONLY) ---(Handled in app.js) ---

// --- 3. START SERVER (LOCAL DEVELOPMENT ONLY) ---
// Vercel is read-only. We only do this locally.
if (process.env.NODE_ENV !== "production") {
  const uploadDir = "./uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
}

// --- 2. GLOBAL MIDDLEWARES ---

// REQUIRED FOR VERCEL: Trust the proxy so rate-limiter gets the correct user IP
app.set("trust proxy", 1); 

app.use(helmet({ contentSecurityPolicy: false }));

// Updated CORS to handle multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // Your Vercel frontend URL
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
  max: 100,
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Static uploads only work locally. For production, ensure you use Cloudinary.
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static("uploads"));
}
app.get("/", (req, res) => {
  res.send("Server is running!");
});
// --- 3. MOUNT ROUTES ---
// HEALTH CHECK ROUTE (Add this to verify backend is live)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Backend is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/consumables", consumableRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/requests", requestRoutes);

// --- 4. CATCH-ALL & ERRORS ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;