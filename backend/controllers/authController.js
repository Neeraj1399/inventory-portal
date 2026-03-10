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
 * 1. PROTECT MIDDLEWARE
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError("You are not logged in!", 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await Employee.findById(decoded.id);
    if (!currentUser) return next(new AppError("User no longer exists", 401));

    req.user = currentUser;
    next();
  } catch (err) {
    next(new AppError("Invalid token. Please log in again!", 401));
  }
};

/**
 * 2. LOGIN
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide credentials", 400));
    }

    const user = await Employee.findOne({ email }).select(
      "+password +passwordResetRequired",
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
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
        role: user.role,
        email: user.email,
        passwordResetRequired: user.passwordResetRequired,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. LOGOUT (Added this back to fix your crash)
 */
export async function logout(req, res) {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
}

/**
 * 4. UPDATE PASSWORD
 */
export async function updatePassword(req, res, next) {
  try {
    const { password, passwordConfirm } = req.body;

    // 1. Complexity & Length Validation (Min 10 characters)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;

    if (!passwordRegex.test(password)) {
      return next(
        new AppError(
          "Security Requirement: Password must be at least 10 characters long and include uppercase, lowercase, a number, and a special character.",
          400
        )
      );
    }

    // 2. Fetch the current user (including the hidden password field)
    const user = await Employee.findById(req.user.id).select("+password");

    // 3. NEW: Check if the new password is the SAME as the old Admin password
    const isSameAsOld = await bcrypt.compare(password, user.password);
    if (isSameAsOld) {
      return next(
        new AppError(
          "Security Policy: Your new password cannot be the same as the temporary password provided by the Admin.",
          400
        )
      );
    }

    // 4. Match check (New Password vs Confirm Password)
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match!", 400));
    }

    // 5. Update and flip the reset flag
    user.password = password;
    user.passwordResetRequired = false;
    await user.save(); 

    res.status(200).json({
      status: "success",
      message: "Password updated successfully! Please log in with your new credentials.",
    });
  } catch (err) {
    next(err);
  }
}