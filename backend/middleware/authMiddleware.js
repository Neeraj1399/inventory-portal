// import jwt from "jsonwebtoken";
// import { promisify } from "util";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";
// import catchAsync from "../utils/catchAsync.js";

// /**
//  * Protect Middleware: The "Gatekeeper"
//  * Checks for a valid Access Token in Headers or Cookies
//  */
// export const protect = catchAsync(async (req, res, next) => {
//   let token;

//   // 1. Get token from Authorization header or Cookies
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     const parts = req.headers.authorization.split(" ");
//     if (parts.length === 2) token = parts[1];
//   } else if (req.cookies?.accessToken) {
//     token = req.cookies.accessToken;
//   }

//   if (!token) {
//     return next(new AppError("Not authenticated. Please log in.", 401));
//   }

//   // 2. Verify Access Token (Using ACCESS secret, not general secret)
//   let decoded;
//   try {
//     decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
//   } catch (err) {
//     // If expired, the frontend Axios interceptor catches this 401 and calls /refresh
//     return next(new AppError("Session expired. Please refresh token.", 401));
//   }

//   // 3. Check if user still exists
//   const currentUser = await Employee.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError("The user belonging to this session no longer exists.", 401),
//     );
//   }

//   // 4. Check if password was changed after token was issued (Security extra)
//   if (currentUser.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       currentUser.passwordChangedAt.getTime() / 1000,
//       10,
//     );
//     if (decoded.iat < changedTimestamp) {
//       return next(
//         new AppError(
//           "User recently changed password! Please log in again.",
//           401,
//         ),
//       );
//     }
//   }

//   // 5. Grant Access
//   req.user = currentUser;
//   next();
// });

// /**
//  * Role-Based Access Control (RBAC)
//  */
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return next(new AppError("Authentication required.", 401));
//     }

//     // Standardize role comparison to uppercase
//     const userRoleAccess = (req.user.roleAccess || "").toUpperCase();
//     const allowedRoles = roles.map((r) => r.toUpperCase());

//     if (!allowedRoles.includes(userRoleAccess)) {
//       return next(
//         new AppError("Access denied. Insufficient permissions.", 403),
//       );
//     }

//     next();
//   };
// };

// // Aliases for common roles
// export const isAdmin = restrictTo("ADMIN");
// export const isStaff = restrictTo("STAFF");
import jwt from "jsonwebtoken";
import { promisify } from "util";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * @desc    Verify Access Token and Attach User to Request
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extraction: Header (Bearer) or Cookies
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to gain access.", 401),
    );
  }

  // 2. Verification: Validate against the ACCESS secret
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    // Distinguish between expired and malformed for the frontend interceptor
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please refresh your token."
        : "Invalid session. Please log in again.";
    return next(new AppError(message, 401));
  }

  // 3. User Existence: Ensure user hasn't been deleted or offboarded since token issuance
  const currentUser = await Employee.findById(decoded.id).select("+status");

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  if (currentUser.status === "OFFBOARDED") {
    return next(new AppError("This account has been deactivated.", 403));
  }

  // 4. Security Check: Use model method to see if password changed after token issuance
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }

  // 5. Grant Access: Attach user object to the request
  req.user = currentUser;
  next();
});

/**
 * @desc    Authorization Middleware (RBAC)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Standardize comparison to uppercase for case-insensitivity
    const userRole = (req.user.roleAccess || "").toUpperCase();
    const authorized = roles.some((role) => role.toUpperCase() === userRole);

    if (!authorized) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
};

/**
 * @desc    Specialized middleware for Password Change Force
 */
export const ensurePasswordChanged = (req, res, next) => {
  if (req.user.passwordResetRequired) {
    return next(
      new AppError("You must change your password before continuing.", 403),
    );
  }
  next();
};

// Aliases for cleaner route definitions
export const isAdmin = restrictTo("ADMIN");
export const isStaff = restrictTo("STAFF");
