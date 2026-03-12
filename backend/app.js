import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import cookieParser from "cookie-parser"; 

// Routes
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import consumableRoutes from "./routes/consumableRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

// Middleware & Utils
import globalErrorHandler from "./middleware/errorMiddleware.js";
import AppError from "./utils/appError.js";

const app = express();

// --- 1. INITIALIZATION ---
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- 2. SECURITY & UTILITY MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false }));

// //update: CORS must allow credentials and have a specific origin for cookies to work
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your actual frontend URL
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser()); // //update: Mount cookie parser BEFORE routes

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Serve static files
app.use("/uploads", express.static("uploads"));

// --- 3. MOUNT ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/consumables", consumableRoutes);
app.use("/api/audit-logs", auditRoutes);

// --- 4. CATCH-ALL & ERRORS ---
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;