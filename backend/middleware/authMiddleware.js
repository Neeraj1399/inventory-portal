import jwt from "jsonwebtoken";
import { promisify } from "util";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Protect Middleware: The "Gatekeeper"
 * Checks for a valid Access Token in Headers or Cookies
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Get token from Authorization header or Cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2) token = parts[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("Not authenticated. Please log in.", 401));
  }

  // 2. Verify Access Token (Using ACCESS secret, not general secret)
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    // If expired, the frontend Axios interceptor catches this 401 and calls /refresh
    return next(new AppError("Session expired. Please refresh token.", 401));
  }

  // 3. Check if user still exists
  const currentUser = await Employee.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this session no longer exists.", 401),
    );
  }

  // 4. Check if password was changed after token was issued (Security extra)
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10,
    );
    if (decoded.iat < changedTimestamp) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401,
        ),
      );
    }
  }

  // 5. Grant Access
  req.user = currentUser;
  next();
});

/**
 * Role-Based Access Control (RBAC)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    // Standardize role comparison to uppercase
    const userRoleAccess = (req.user.roleAccess || "").toUpperCase();
    const allowedRoles = roles.map((r) => r.toUpperCase());

    if (!allowedRoles.includes(userRoleAccess)) {
      return next(
        new AppError("Access denied. Insufficient permissions.", 403),
      );
    }

    next();
  };
};

// Aliases for common roles
export const isAdmin = restrictTo("ADMIN");
export const isStaff = restrictTo("STAFF");
