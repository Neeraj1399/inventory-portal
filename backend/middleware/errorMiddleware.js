//Since your terminal confirms Next function exists? true, your controller is receiving the next function correctly. However, the syntax errors in the globalErrorHandler you shared previously are likely preventing Express from executing the error-handling logic, leading to the "Internal Server Error" on the frontend.

//🛠️ The Corrected globalErrorHandler.js
//Here is the fully functional, syntax-cleansed version of your error middleware. Replace your current file content with this to ensure the brackets and logic are properly aligned: JavaScript
import AppError from "../utils/appError.js";

/* Converts raw DB/System errors into user-friendly AppErrors */
const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Safe extraction of the duplicate value from the error message
  const message = err.errmsg || err.message || "";
  const match = message.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : "Unknown value";

  return new AppError(
    `Duplicate item: ${value}. This item already exists in inventory!`,
    400,
  );
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/**
 * Global Error Handling Middleware
 * Express requires exactly 4 arguments to recognize this as an error handler.
 */
// MUST have all 4 arguments: (err, req, res, next)
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error("❌ GLOBAL ERROR LOG:", err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // stack: err.stack // Only show stack in development
  });
};

export default globalErrorHandler;


