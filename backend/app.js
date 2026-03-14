// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import fs from "fs";
// import cookieParser from "cookie-parser";

// // Routes
// import authRoutes from "./routes/authRoutes.js";
// import assetRoutes from "./routes/assetRoutes.js";
// import employeeRoutes from "./routes/employeeRoutes.js";
// import consumableRoutes from "./routes/consumableRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import auditRoutes from "./routes/auditRoutes.js";

// // Middleware & Utils
// import globalErrorHandler from "./middleware/errorMiddleware.js";
// import AppError from "./utils/appError.js";

// const app = express();

// // --- 1. INITIALIZATION ---
// const uploadDir = "./uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // --- 2. SECURITY & UTILITY MIDDLEWARES ---
// app.use(helmet({ contentSecurityPolicy: false }));

// // //update: CORS must allow credentials and have a specific origin for cookies to work
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Replace with your actual frontend URL
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10kb" }));
// app.use(cookieParser()); // //update: Mount cookie parser BEFORE routes

// if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// // Serve static files
// app.use("/uploads", express.static("uploads"));

// // --- 3. MOUNT ROUTES ---
// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/assets", assetRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/consumables", consumableRoutes);
// app.use("/api/audit-logs", auditRoutes);

// // --- 4. CATCH-ALL & ERRORS ---
// app.use((req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// app.use(globalErrorHandler);

// export default app;
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import fs from "fs";
// import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";

// // Routes
// import authRoutes from "./routes/authRoutes.js";
// import assetRoutes from "./routes/assetRoutes.js";
// import employeeRoutes from "./routes/employeeRoutes.js";
// import consumableRoutes from "./routes/consumableRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import auditRoutes from "./routes/auditRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js"; // Added from our earlier controller

// // Middleware & Utils
// import globalErrorHandler from "./middleware/errorMiddleware.js";
// import AppError from "./utils/appError.js";

// const app = express();

// // --- 1. DIRECTORY INITIALIZATION ---
// // Ensure upload directory exists for asset/profile images
// const uploadDir = "./uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // --- 2. GLOBAL MIDDLEWARES ---

// // Security Headers
// app.use(helmet({ contentSecurityPolicy: false }));

// // CORS Configuration: Essential for cross-origin cookie handling
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// // Logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// // Rate Limiting: Prevent Brute Force on Auth endpoints
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message:
//     "Too many login attempts from this IP, please try again after 15 minutes",
// });
// app.use("/api/auth", authLimiter);

// // Body Parsers & Cookies
// app.use(express.json({ limit: "10kb" }));
// app.use(cookieParser());

// // Static File Serving
// app.use("/uploads", express.static("uploads"));

// // --- 3. MOUNT ROUTES ---
// app.use("/api/auth", authRoutes);
// app.use("/api/admin/system", adminRoutes); // Mounted the system admin routes
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/assets", assetRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/consumables", consumableRoutes);
// app.use("/api/audit-logs", auditRoutes);

// // --- 4. ERROR HANDLING ---

// // --- 4. CATCH-ALL & ERRORS ---
// app.use((req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// // Centralized Error Middleware (Handles all catchAsync errors)
// app.use(globalErrorHandler);

// export default app;
import express from "express";
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

// Middleware & Utils
import globalErrorHandler from "./middleware/errorMiddleware.js";
import AppError from "./utils/appError.js";

const app = express();

// --- 1. DIRECTORY INITIALIZATION ---
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- 2. GLOBAL MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// --- 3. MOUNT ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employees", employeeRoutes); // Now strictly Staff-Self-Service
app.use("/api/consumables", consumableRoutes);
app.use("/api/audit-logs", auditRoutes);

// --- 4. CATCH-ALL & ERRORS ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
