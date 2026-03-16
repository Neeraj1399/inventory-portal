import jwt from "jsonwebtoken";
import { promisify } from "util";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * @desc    Main Auth Guard: Validates JWT and attaches the current user to the request
 * @middleware protect
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract token from Header or Cookies
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("Not authenticated. Please log in to gain access.", 401));
  }

  // 2. Verify token against the Access Secret
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    const message = err.name === "TokenExpiredError" 
      ? "Session expired. Please refresh your token." 
      : "Invalid session. Please log in again.";
    return next(new AppError(message, 401));
  }

  // 3. Verify user still exists and hasn't been offboarded
  const currentUser = await Employee.findById(decoded.id).select("+status");

  if (!currentUser) {
    return next(new AppError("The user belonging to this session no longer exists.", 401));
  }

  if (currentUser.status === "OFFBOARDED") {
    return next(new AppError("Access denied. This account has been deactivated.", 403));
  }

  // 4. Security: Check if password changed after token was issued
  // This assumes you have a 'changedPasswordAfter' instance method in your Employee model
  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("Password was recently changed. Please log in again.", 401));
  }

  // 5. Success: Store user in request for subsequent middleware/controllers
  req.user = currentUser;
  next();
});

/**
 * @desc    Role-Based Access Control (RBAC)
 * @middleware restrictTo
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Standardize role to uppercase for robust comparison
    const userRole = (req.user.roleAccess || "").toUpperCase();
    const isAuthorized = roles.some((role) => role.toUpperCase() === userRole);

    if (!isAuthorized) {
      return next(new AppError("Forbidden. Insufficient permissions for this action.", 403));
    }

    next();
  };
};

/**
 * @desc    Forces user to hit the password change endpoint if required
 * @middleware ensurePasswordChanged
 */
export const ensurePasswordChanged = (req, res, next) => {
  if (req.user.passwordResetRequired) {
    return next(new AppError("Action required: You must change your temporary password.", 403));
  }
  next();
};

// Aliases for clean usage in route files
export const isAdmin = restrictTo("ADMIN");
export const isStaff = restrictTo("STAFF");