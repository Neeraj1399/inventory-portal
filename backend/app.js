// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import fs from "fs";
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
// const uploadDir = "./uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
//   console.log("📁 Created missing uploads folder");
// }
// const app = express();

// // 1. GLOBAL MIDDLEWARES
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// // 2. MOUNT ROUTES
// app.use("/api/auth", authRoutes);
// app.use("/api/assets", assetRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/consumables", consumableRoutes);
// app.use("/api/audit-logs", auditRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// // 3. CATCH-ALL FOR UNDEFINED ROUTES
// app.use((req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// // 4. GLOBAL ERROR HANDLER (Must be last!)
// app.use(globalErrorHandler);

// export default app;
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";

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
app.use(helmet({ contentSecurityPolicy: false })); // Flexible for dev
app.use(cors());
app.use(express.json({ limit: "10kb" })); // Security: Limit body size
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Serve static files (uploads)
app.use("/uploads", express.static("uploads"));

// --- 3. MOUNT ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes); // Dashboard checks roleAccess
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
