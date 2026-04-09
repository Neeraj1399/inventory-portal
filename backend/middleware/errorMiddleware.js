import AppError from "../utils/appError.js";
import ErrorLog from "../models/ErrorLog.js";

/* 1. Mongoose / DB Error Transformers */
const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = err.errmsg || err.message || "";
  const match = message.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : "Unknown value";
  return new AppError(`Duplicate item: ${value}. This item already exists in inventory!`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation failed: ${errors.join(". ")}`, 400);
};

/* 2. Authentication Error Transformers */
const handleJWTError = () => new AppError("Invalid session. Please log in again!", 401);
const handleJWTExpiredError = () => new AppError("Your session has expired. Please log in again.", 401);

/* 3. Helper: Save Error to DB (Industry Standard for Production) */
const saveErrorToDB = async (err, req) => {
  if (process.env.DB_LOGGING !== "true") return;

  try {
    await ErrorLog.create({
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
      ipAddress: req.ip || req.connection.remoteAddress,
      performedBy: req.user?._id,
      userAgent: req.headers["user-agent"],
      errorName: err.name,
    });
  } catch (logErr) {
    console.error("❌ CRITICAL: Failed to save ErrorLog to DB:", logErr.message);
  }
};

/* 4. Global Error Handler */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Always attempt to log to DB if enabled, regardless of environment
  if (err.statusCode === 500 || err.isOperational) {
    saveErrorToDB(err, req);
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ DEV ERROR LOG:", err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // PRODUCTION MODE: Hide technical details, provide clean feedback
  let error = Object.assign(err);
  error.message = err.message;

  // Transform internal system errors into operational AppErrors
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Log critical (500) or operational errors to DB if configured
  if (error.statusCode === 500 || error.isOperational) {
    saveErrorToDB(error, req);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.isOperational ? error.message : "Internal system failure. Please contact support.",
  });
};

export default globalErrorHandler;


