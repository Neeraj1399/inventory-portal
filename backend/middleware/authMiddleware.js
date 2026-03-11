import jwt from "jsonwebtoken";
import { promisify } from "util";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Protect routes: Only allow logged-in users
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1️⃣ Check Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please login.", 401));
  }

  // 2️⃣ Verify JWT
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(
      new AppError("Invalid or expired token. Please login again.", 401),
    );
  }

  // 3️⃣ Fetch current user
  const currentUser = await Employee.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // 4️⃣ Optional: Check if password was changed after token was issued
  if (
    currentUser.changedPasswordAfter &&
    currentUser.changedPasswordAfter(decoded.iat)
  ) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }

  // 5️⃣ Attach user to request
  req.user = currentUser;
  next();
});

/**
 * Restrict access based on roleAccess
 * @param  {...string} roles - List of allowed roleAccess (e.g., ADMIN, STAFF)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You are not logged in!", 401));
    }

    // Use roleAccess (ADMIN/STAFF) instead of job title
    const userRoleAccess = (req.user.roleAccess || "").toUpperCase();
    const allowedRoles = roles.map((r) => r.toUpperCase());

    if (!allowedRoles.includes(userRoleAccess)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

// Shortcut for admin-only routes
export const isAdmin = restrictTo("ADMIN");

// Optional: Shortcut for staff-only routes
export const isStaff = restrictTo("STAFF");
