// import Employee from "../models/Employee.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import AppError from "../utils/appError.js";
// import mongoose from "mongoose";
// export const protect = async (req, res, next) => {
//   try {
//     // 1. Get token from header
//     let token;
//     if (req.headers.authorization?.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) return next(new AppError("You are not logged in!", 401));

//     // 2. Verify token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     // 3. Check if user still exists
//     const currentUser = await Employee.findById(decoded.id);
//     if (!currentUser) return next(new AppError("User no longer exists", 401));

//     // 4. Grant access to protected route
//     req.user = currentUser;
//     next();
//   } catch (err) {
//     next(new AppError("Invalid token. Please log in again!", 401));
//   }
// };

// // 5. Role-based access control
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(new AppError("You do not have permission!", 403));
//     }
//     next();
//   };
// };
// /**
//  * @desc    Log out employee / Clear session
//  * @route   POST /api/auth/logout
//  * @access  Public
//  */
// export async function logout(req, res) {
//   // If you use cookies for tokens, we clear them here
//   res.cookie("token", "loggedout", {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });

//   res.status(200).json({
//     status: "success",
//     message: "Logged out successfully",
//   });
// }
// /**
//  * @desc    Log in employee & get token
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// export async function login(req, res, next) {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new AppError("Please provide valid credentials", 400));
//     }

//     // 2. Add 'passwordResetRequired' to the selected fields
//     const user = await Employee.findOne({ email }).select(
//       "+password +passwordResetRequired",
//     );

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return next(new AppError("Incorrect email or password", 401));
//     }

//     if (!process.env.JWT_SECRET) {
//       return next(new AppError("Internal server configuration error", 500));
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" },
//     );

//     user.lastLogin = Date.now();
//     await user.save({ validateBeforeSave: false });

//     // 6. SEND THE FLAG TO FRONTEND
//     res.status(200).json({
//       status: "success",
//       token,
//       // Add this boolean here
//       mustChangePassword: user.passwordResetRequired,
//       data: {
//         name: user.name,
//         role: user.role,
//         email: user.email,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// /**
//  * @desc    User changes their temporary password
//  * @route   PATCH /api/auth/update-password
//  * @access  Private (Needs 'protect' middleware)
//  */
// export async function updatePassword(req, res, next) {
//   try {
//     const { password, passwordConfirm } = req.body;

//     // 1. Basic check
//     if (!password || password !== passwordConfirm) {
//       return next(new AppError("Passwords do not match!", 400));
//     }

//     // 2. Find current user (req.user is set by your 'protect' middleware)
//     const user = await Employee.findById(req.user.id);

//     // 3. Update password and reset the flag
//     user.password = password;
//     user.passwordResetRequired = false;
//     await user.save(); // The 'pre-save' hook will hash this automatically

//     res.status(200).json({
//       status: "success",
//       message: "Password updated successfully. You can now access the portal.",
//     });
//   } catch (err) {
//     next(err);
//   }
// }
import { promisify } from "util";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";

/**
 * 1️⃣ Protect Middleware
 * Checks if a JWT token exists, verifies it, and attaches the user to req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in!", 401));
    }

    // Verify JWT
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const currentUser = await Employee.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401),
      );
    }

    req.user = currentUser; // attach user to request
    next();
  } catch (err) {
    return next(new AppError("Invalid token. Please log in again!", 401));
  }
};

/**
 * 2️⃣ Login Controller
 * Validates credentials, returns JWT and user info
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Include password, passwordResetRequired, and roleAccess
    const user = await Employee.findOne({ email }).select(
      "+password +passwordResetRequired +roleAccess",
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // Sign JWT with id and roleAccess (important!)
    const token = jwt.sign(
      { id: user._id, roleAccess: user.roleAccess },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      token,
      mustChangePassword: user.passwordResetRequired,
      data: {
        name: user.name,
        email: user.email,
        role: user.role, // Job title
        roleAccess: user.roleAccess, // ADMIN or STAFF
        passwordResetRequired: user.passwordResetRequired,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3️⃣ Logout Controller
 */
export const logout = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

/**
 * 4️⃣ Update Password Controller
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { password, passwordConfirm } = req.body;

    // Password complexity: min 10 chars, uppercase, lowercase, number, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

    if (!passwordRegex.test(password)) {
      return next(
        new AppError(
          "Password must be at least 10 characters, include uppercase, lowercase, number, and special character",
          400,
        ),
      );
    }

    // Fetch current user with password field
    const user = await Employee.findById(req.user._id).select("+password");

    // Prevent reusing old password
    const isSameAsOld = await bcrypt.compare(password, user.password);
    if (isSameAsOld) {
      return next(
        new AppError(
          "Your new password cannot be the same as your temporary or previous password",
          400,
        ),
      );
    }

    // Password match check
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match!", 400));
    }

    // Update password and reset flag
    user.password = password;
    user.passwordResetRequired = false;
    await user.save();

    res.status(200).json({
      status: "success",
      message:
        "Password updated successfully! Please log in with your new credentials.",
    });
  } catch (err) {
    next(err);
  }
};
