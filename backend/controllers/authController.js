// import { promisify } from "util";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";

// /**
//  * 1️⃣ Protect Middleware
//  * Checks if a JWT token exists, verifies it, and attaches the user to req.user
//  */
// export const protect = async (req, res, next) => {
//   try {
//     let token;

//     // Get token from Authorization header
//     if (req.headers.authorization?.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return next(new AppError("You are not logged in!", 401));
//     }

//     // Verify JWT
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     // Fetch user from DB
//     const currentUser = await Employee.findById(decoded.id);
//     if (!currentUser) {
//       return next(
//         new AppError("The user belonging to this token no longer exists", 401),
//       );
//     }

//     req.user = currentUser; // attach user to request
//     next();
//   } catch (err) {
//     return next(new AppError("Invalid token. Please log in again!", 401));
//   }
// };

// /**
//  * 2️⃣ Login Controller
//  * Validates credentials, returns JWT and user info
//  */
// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new AppError("Please provide email and password", 400));
//     }

//     // Include password, passwordResetRequired, and roleAccess
//     const user = await Employee.findOne({ email }).select(
//       "+password +passwordResetRequired +roleAccess",
//     );

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return next(new AppError("Incorrect email or password", 401));
//     }

//     // Sign JWT with id and roleAccess (important!)
//     const token = jwt.sign(
//       { id: user._id, roleAccess: user.roleAccess },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" },
//     );

//     user.lastLogin = Date.now();
//     await user.save({ validateBeforeSave: false });

//     res.status(200).json({
//       status: "success",
//       token,
//       mustChangePassword: user.passwordResetRequired,
//       data: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         roleAccess: user.roleAccess,
//         passwordResetRequired: user.passwordResetRequired,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * 3️⃣ Logout Controller
//  */
// export const logout = async (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Logged out successfully",
//   });
// };

// /**
//  * 4️⃣ Update Password Controller
//  */
// export const updatePassword = async (req, res, next) => {
//   try {
//     const { password, passwordConfirm } = req.body;

//     // Password complexity: min 10 chars, uppercase, lowercase, number, special char
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

//     if (!passwordRegex.test(password)) {
//       return next(
//         new AppError(
//           "Password must be at least 10 characters, include uppercase, lowercase, number, and special character",
//           400,
//         ),
//       );
//     }

//     // Fetch current user with password field
//     const user = await Employee.findById(req.user._id).select("+password");

//     // Prevent reusing old password
//     const isSameAsOld = await bcrypt.compare(password, user.password);
//     if (isSameAsOld) {
//       return next(
//         new AppError(
//           "Your new password cannot be the same as your temporary or previous password",
//           400,
//         ),
//       );
//     }

//     // Password match check
//     if (password !== passwordConfirm) {
//       return next(new AppError("Passwords do not match!", 400));
//     }

//     // Update password and reset flag
//     user.password = password;
//     user.passwordResetRequired = false;
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       message:
//         "Password updated successfully! Please log in with your new credentials.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// import { promisify } from "util";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";
// import catchAsync from "../utils/catchAsync.js";

// // Helper to sign tokens
// const signAccessToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
// };

// const signRefreshToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
// };

// export const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError("Please provide email and password", 400));
//   }

//   const user = await Employee.findOne({ email }).select(
//     "+password +roleAccess",
//   );

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return next(new AppError("Incorrect email or password", 401));
//   }

//   // Generate tokens
//   const accessToken = signAccessToken(user._id);
//   const refreshToken = signRefreshToken(user._id);

//   // //update: Storing the refresh token in the DB
//   user.refreshToken = refreshToken;
//   await user.save({ validateBeforeSave: false });

//   // //update: Storing tokens in HTTP-only cookies
//   const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Lax",
//   };

//   res.cookie("accessToken", accessToken, {
//     ...cookieOptions,
//     expires: new Date(Date.now() + 15 * 60 * 1000),
//   });
//   res.cookie("refreshToken", refreshToken, {
//     ...cookieOptions,
//     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//   });

//   res.status(200).json({
//     status: "success",
//     accessToken, // Still sent for header-based auth if needed
//     data: { user },
//   });
// });

// // //update: New method to handle the "Stored Token"
// export const refresh = catchAsync(async (req, res, next) => {
//   const token = req.cookies.refreshToken;

//   if (!token) return next(new AppError("No refresh token found", 401));

//   const decoded = await promisify(jwt.verify)(
//     token,
//     process.env.JWT_REFRESH_SECRET,
//   );

//   const user = await Employee.findById(decoded.id).select("+refreshToken");

//   // Check if stored token matches provided token
//   if (!user || user.refreshToken !== token) {
//     return next(new AppError("Invalid refresh token", 401));
//   }

//   const newAccessToken = signAccessToken(user._id);

//   res.cookie("accessToken", newAccessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     expires: new Date(Date.now() + 15 * 60 * 1000),
//   });

//   res.status(200).json({ status: "success", accessToken: newAccessToken });
// });

// export const logout = catchAsync(async (req, res, next) => {
//   // //update: Clear token from DB
//   if (req.user) {
//     await Employee.findByIdAndUpdate(req.user._id, { refreshToken: null });
//   }

//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");
//   res.status(200).json({ status: "success", message: "Logged out" });
// });

// export const updatePassword = catchAsync(async (req, res, next) => {
//   const { password, passwordConfirm } = req.body;
//   const user = await Employee.findById(req.user._id).select("+password");

//   if (await bcrypt.compare(password, user.password)) {
//     return next(new AppError("Cannot use old password", 400));
//   }

//   if (password !== passwordConfirm) {
//     return next(new AppError("Passwords do not match", 400));
//   }

//   user.password = password;
//   user.passwordResetRequired = false;
//   // //update: Invalidate old refresh token on password change for security
//   user.refreshToken = null;
//   await user.save();

//   res.status(200).json({ status: "success", message: "Password updated" });
// });
import { promisify } from "util";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// --- HELPERS ---

const signToken = (id, secret, expires) => {
  return jwt.sign({ id }, secret, { expiresIn: expires });
};

/**
 * Utility to set secure cookies and send response
 */
const createSendToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id, process.env.JWT_ACCESS_SECRET, "15m");
  const refreshToken = signToken(
    user._id,
    process.env.JWT_REFRESH_SECRET,
    "7d",
  );

  // Store refresh token in Database
  user.refreshToken = refreshToken;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken,
    mustChangePassword: user.passwordResetRequired,
    data: { user },
  });
};

// --- CONTROLLERS ---

/**
 * Professional Hydration: Returns current user based on protect middleware
 */
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

/**
 * Standard Login
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await Employee.findOne({ email }).select(
    "+password +roleAccess +passwordResetRequired",
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  await createSendToken(user, 200, res);
});

/**
 * Refresh Access Token using Stored Refresh Token
 */
export const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) return next(new AppError("No refresh token found", 401));

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_REFRESH_SECRET,
  );

  const user = await Employee.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  const newAccessToken = signToken(
    user._id,
    process.env.JWT_ACCESS_SECRET,
    "15m",
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});

/**
 * Logout: Clears DB and Cookies
 */
export const logout = catchAsync(async (req, res, next) => {
  if (req.user) {
    await Employee.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * Update Password with Strength Validation
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // 1. Password Complexity Check
  // Min 10 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be at least 10 characters and include uppercase, lowercase, a number, and a special character.",
        400,
      ),
    );
  }

  // 2. Fetch user with password field (needed for bcrypt comparison)
  const user = await Employee.findById(req.user._id).select("+password");

  // 3. Prevent using the current password
  if (await bcrypt.compare(password, user.password)) {
    return next(
      new AppError(
        "New password cannot be the same as your current password.",
        400,
      ),
    );
  }

  // 4. Confirm match
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  // 5. Update and Invalidate sessions
  user.password = password;
  user.passwordResetRequired = false;
  user.refreshToken = null; // Forces a fresh login on all devices

  // Note: Your pre-save middleware in the Employee model should handle hashing the password
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully. Please log in again.",
  });
});
