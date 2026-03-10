import jwt from "jsonwebtoken";
import { promisify } from "util";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please login.", 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await Employee.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // SAFE CHECK: Only call changedPasswordAfter if it exists on the model
  if (
    currentUser.changedPasswordAfter &&
    currentUser.changedPasswordAfter(decoded.iat)
  ) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Check if user exists
    if (!req.user) {
      return next(new AppError("You are not logged in!", 401));
    }

    // 2. Make it case-insensitive to be safe
    const userRole = req.user.role.toUpperCase();

    if (!roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

export const isAdmin = restrictTo("ADMIN");
