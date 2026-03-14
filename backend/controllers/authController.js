// import { promisify } from "util";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";
// import catchAsync from "../utils/catchAsync.js";

// // --- HELPERS ---

// const signToken = (id, secret, expires) => {
//   return jwt.sign({ id }, secret, { expiresIn: expires });
// };

// /**
//  * Utility to set secure cookies and send response
//  */
// const createSendToken = async (user, statusCode, res) => {
//   const accessToken = signToken(user._id, process.env.JWT_ACCESS_SECRET, "15m");
//   const refreshToken = signToken(
//     user._id,
//     process.env.JWT_REFRESH_SECRET,
//     "7d",
//   );

//   // Store refresh token in Database
//   user.refreshToken = refreshToken;
//   user.lastLogin = Date.now();
//   await user.save({ validateBeforeSave: false });

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

//   // Remove password from output
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: "success",
//     accessToken,
//     mustChangePassword: user.passwordResetRequired,
//     data: { user },
//   });
// };

// // --- CONTROLLERS ---

// /**
//  * Professional Hydration: Returns current user based on protect middleware
//  */
// export const getMe = catchAsync(async (req, res, next) => {
//   res.status(200).json({
//     status: "success",
//     data: { user: req.user },
//   });
// });

// /**
//  * Standard Login
//  */
// export const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError("Please provide email and password", 400));
//   }

//   const user = await Employee.findOne({ email }).select(
//     "+password +roleAccess +passwordResetRequired",
//   );

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return next(new AppError("Incorrect email or password", 401));
//   }

//   await createSendToken(user, 200, res);
// });

// /**
//  * Refresh Access Token using Stored Refresh Token
//  */
// export const refresh = catchAsync(async (req, res, next) => {
//   const token = req.cookies.refreshToken;

//   if (!token) return next(new AppError("No refresh token found", 401));

//   const decoded = await promisify(jwt.verify)(
//     token,
//     process.env.JWT_REFRESH_SECRET,
//   );

//   const user = await Employee.findById(decoded.id).select("+refreshToken");

//   if (!user || user.refreshToken !== token) {
//     return next(new AppError("Invalid or expired refresh token", 401));
//   }

//   const newAccessToken = signToken(
//     user._id,
//     process.env.JWT_ACCESS_SECRET,
//     "15m",
//   );

//   res.cookie("accessToken", newAccessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Lax",
//     expires: new Date(Date.now() + 15 * 60 * 1000),
//   });

//   res.status(200).json({
//     status: "success",
//     accessToken: newAccessToken,
//   });
// });

// /**
//  * Logout: Clears DB and Cookies
//  */
// export const logout = catchAsync(async (req, res, next) => {
//   if (req.user) {
//     await Employee.findByIdAndUpdate(req.user._id, { refreshToken: null });
//   }

//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");

//   res.status(200).json({
//     status: "success",
//     message: "Logged out successfully",
//   });
// });

// /**
//  * Update Password with Strength Validation
//  */
// export const updatePassword = catchAsync(async (req, res, next) => {
//   const { password, passwordConfirm } = req.body;

//   // 1. Password Complexity Check
//   // Min 10 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
//   const passwordRegex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

//   if (!passwordRegex.test(password)) {
//     return next(
//       new AppError(
//         "Password must be at least 10 characters and include uppercase, lowercase, a number, and a special character.",
//         400,
//       ),
//     );
//   }

//   // 2. Fetch user with password field (needed for bcrypt comparison)
//   const user = await Employee.findById(req.user._id).select("+password");

//   // 3. Prevent using the current password
//   if (await bcrypt.compare(password, user.password)) {
//     return next(
//       new AppError(
//         "New password cannot be the same as your current password.",
//         400,
//       ),
//     );
//   }

//   // 4. Confirm match
//   if (password !== passwordConfirm) {
//     return next(new AppError("Passwords do not match.", 400));
//   }

//   // 5. Update and Invalidate sessions
//   user.password = password;
//   user.passwordResetRequired = false;
//   user.refreshToken = null; // Forces a fresh login on all devices

//   // Note: Your pre-save middleware in the Employee model should handle hashing the password
//   await user.save();

//   res.status(200).json({
//     status: "success",
//     message: "Password updated successfully. Please log in again.",
//   });
// });
import { promisify } from "util";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/email.js"; 
// --- HELPERS ---

const signToken = (id, secret, expires) => {
  return jwt.sign({ id }, secret, { expiresIn: expires });
};

/**
 * Sets secure cookies and sends JSON response with tokens
 */
const createSendToken = async (user, statusCode, res) => {
  const accessToken = signToken(user._id, process.env.JWT_ACCESS_SECRET, "15m");
  const refreshToken = signToken(
    user._id,
    process.env.JWT_REFRESH_SECRET,
    "7d",
  );

  // Store refresh token in Database and update last login
  user.refreshToken = refreshToken;
  // Note: Added validateBeforeSave: false to allow updates without re-triggering
  // full model validation on fields not present in this operation.
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };

  // Set Access Token Cookie
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  // Set Refresh Token Cookie
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Security: Remove sensitive fields from the response object
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    status: "success",
    accessToken,
    mustChangePassword: user.passwordResetRequired,
    data: { user },
  });
};

// --- CONTROLLERS ---

/**
 * @desc    Get Current Logged-in User
 */
export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

/**
 * @desc    Standard Login using Model Methods
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password.", 400));
  }

  // Find user and explicitly select password for comparison
  const user = await Employee.findOne({ email }).select(
    "+password +roleAccess +passwordResetRequired",
  );

  // Use the model instance method 'correctPassword'
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  // Prevent login if account is deactivated
  if (user.status === "OFFBOARDED") {
    return next(
      new AppError("This account has been deactivated. Contact HR.", 403),
    );
  }

  await createSendToken(user, 200, res);
});

/**
 * @desc    Refresh Access Token using Stored Refresh Token
 */
export const refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token)
    return next(new AppError("Session expired. Please log in again.", 401));

  // Verify the refresh token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_REFRESH_SECRET,
  );

  // Check if user exists and token matches what is in DB
  const user = await Employee.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    return next(new AppError("Invalid session. Please log in again.", 401));
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
 * @desc    Logout: Clears Database Token and Browser Cookies
 */
export const logout = catchAsync(async (req, res, next) => {
  if (req.user) {
    await Employee.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Successfully logged out.",
  });
});

// /**
//  * @desc    Update Password (Self-Service)
//  */
// export const updatePassword = catchAsync(async (req, res, next) => {
//   const { password, passwordConfirm } = req.body;

//   // 1. Complexity Validation
//   const passwordRegex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;
//   if (!passwordRegex.test(password)) {
//     return next(
//       new AppError(
//         "Password must be 10+ chars with upper, lower, number, and symbol.",
//         400,
//       ),
//     );
//   }

//   if (password !== passwordConfirm) {
//     return next(new AppError("Passwords do not match.", 400));
//   }

//   // 2. Prevent reusing current password
//   const user = await Employee.findById(req.user._id).select("+password");
//   if (await user.correctPassword(password, user.password)) {
//     return next(
//       new AppError(
//         "New password cannot be the same as your current password.",
//         400,
//       ),
//     );
//   }

//   // 3. Update fields
//   user.password = password;
//   user.passwordResetRequired = false;
//   user.refreshToken = null; // Invalidate all existing sessions for security

//   await user.save();

//   // 4. Log the user back in with the new password
//   await createSendToken(user, 200, res);
// });


/**
 * @desc    Update Password (Self-Service & First-time Reset)
 */
export const updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // 1. Complexity Validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be 10+ chars with upper, lower, number, and symbol.",
        400,
      ),
    );
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  // 2. Prevent reusing current password
  const user = await Employee.findById(req.user._id).select("+password");
  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError(
        "New password cannot be the same as your current password.",
        400,
      ),
    );
  }

  // 3. Update fields
  user.password = password;
  user.passwordResetRequired = false; // Mark reset as complete
  user.refreshToken = null;

  await user.save();

  // 4. Send "Success" Email
  try {
    await sendEmail({
      email: user.email,
      subject: "Security Alert: Password Changed Successfully",
      message: `Hello ${user.name},\n\nThis is a confirmation that the password for your Inventory Portal account has been successfully changed.\n\nIf you did not perform this action, please contact the IT Administrator immediately.`,
    });
  } catch (err) {
    console.error("Success email failed to send, but password was updated.");
    // We don't block the user if the confirmation email fails
  }

  // 5. Log the user back in with the new password automatically
  await createSendToken(user, 200, res);
});
