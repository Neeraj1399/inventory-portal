// import { Parser } from "json2csv";
// import mongoose from "mongoose";
// import AuditLog from "../models/AuditLog.js";
// import Asset from "../models/Asset.js";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";
// import crypto from "crypto";

// /**
//  * @desc    Export audit logs to CSV and optionally purge them
//  * @route   POST /api/admin/system/archive-logs
//  * @access  Admin
//  */
// export const archiveAndPurgeLogs = async (req, res, next) => {
//   try {
//     const { confirmPurge } = req.body;

//     // Fetch all logs, populate relevant info
//     const logs = await AuditLog.find()
//       .populate("performedBy", "name email")
//       .populate("targetEmployee", "name email")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!logs.length) {
//       return next(new AppError("No audit logs available to archive.", 404));
//     }

//     // Flatten logs for CSV export
//     const formattedLogs = logs.map((log) => ({
//       timestamp: log.createdAt || "",
//       action: log.action || "",
//       entityType: log.entityType || "",
//       performedBy: log.performedBy?.name || "System",
//       performedByEmail: log.performedBy?.email || "",
//       targetEmployee: log.targetEmployee?.name || "",
//       targetEmployeeEmail: log.targetEmployee?.email || "",
//       description: log.description || "",
//     }));

//     const fields = [
//       "timestamp",
//       "action",
//       "entityType",
//       "performedBy",
//       "performedByEmail",
//       "targetEmployee",
//       "targetEmployeeEmail",
//       "description",
//     ];

//     const parser = new Parser({ fields });
//     const csv = parser.parse(formattedLogs);

//     // Optionally purge logs if confirmed
//     if (confirmPurge === true) {
//       await AuditLog.deleteMany({});
//     }

//     // Set CSV headers
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=audit_log_${Date.now()}.csv`,
//     );

//     return res.status(200).send(csv);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Get system-wide stats and DB health
//  * @route   GET /api/admin/system/stats
//  * @access  Admin
//  */
// export const getSystemStats = async (req, res, next) => {
//   try {
//     // Fetch assets, employee count, broken assets, and DB stats in parallel
//     const [assets, activeEmployees, brokenCount, dbStats] = await Promise.all([
//       Asset.find({ isDeleted: { $ne: true } }).lean(),
//       Employee.countDocuments({ status: "ACTIVE" }),
//       Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
//       mongoose.connection.db.command({ dbStats: 1 }),
//     ]);

//     // Calculate DB usage
//     const sizeBytes = (dbStats?.dataSize || 0) + (dbStats?.indexSize || 0);
//     const sizeMB = sizeBytes / (1024 * 1024);

//     const storageLimitMB = 512; // Atlas Free Tier
//     const percentUsed = (sizeMB / storageLimitMB) * 100;

//     // Build stats object
//     const stats = {
//       inventory: {
//         totalAssets: assets.length,
//         activeEmployees,
//         brokenAssets: brokenCount,
//         needsMaintenance: assets.filter((a) => a.needsMaintenance).length,
//         totalValue: assets.reduce(
//           (sum, asset) => sum + (asset.purchasePrice || 0),
//           0,
//         ),
//       },
//       systemHealth: {
//         dbUsedMB: `${sizeMB.toFixed(2)} MB`,
//         dbLimitMB: `${storageLimitMB} MB`,
//         usagePercent: `${percentUsed.toFixed(1)}%`,
//         isNearLimit: percentUsed > 80,
//       },
//     };

//     return res.status(200).json({
//       status: "success",
//       data: stats,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// /**
//  * @desc    Request Password Reset Token (For Admin/Self-Service)
//  */
// export const forgotPassword = async (req, res, next) => {
//   // 1. Get employee based on posted email
//   const employee = await Employee.findOne({ email: req.body.email });
//   if (!employee) {
//     return next(new AppError("There is no user with that email address.", 404));
//   }

//   // 2. Generate the random reset token
//   const resetToken = crypto.randomBytes(32).toString("hex");

//   // 3. Hash it and save to DB
//   employee.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   employee.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//   await employee.save({ validateBeforeSave: false });

//   // 4. Send it via email (Conceptual - integrate Nodemailer here)
//   const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;

//   console.log(`🔗 Recovery URL: ${resetURL}`);

//   res.status(200).json({
//     status: "success",
//     message: "Token sent to email (check console for link in dev mode)",
//   });
// };

// /**
//  * @desc    Reset Password with Token
//  */
// export const resetPasswordWithToken = async (req, res, next) => {
//   // 1. Get user based on the token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const employee = await Employee.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   // 2. If token has not expired, and there is user, set the new password
//   if (!employee) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }

//   employee.password = req.body.password;
//   employee.passwordResetToken = undefined;
//   employee.passwordResetExpires = undefined;
//   employee.passwordResetRequired = false; // Reset the "Force Change" flag

//   await employee.save();

//   res.status(200).json({
//     status: "success",
//     message: "Password updated successfully! You can now log in.",
//   });
// };
// import { Parser } from "json2csv";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import AuditLog from "../models/AuditLog.js";
// import Asset from "../models/Asset.js";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";

// /**
//  * @desc    Get system-wide stats and DB health
//  * @access  Admin Only
//  */
// export const getSystemStats = async (req, res, next) => {
//   try {
//     const [assets, activeEmployees, brokenCount, dbStats] = await Promise.all([
//       Asset.find({ isDeleted: { $ne: true } }).lean(),
//       Employee.countDocuments({ status: "ACTIVE" }),
//       Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
//       mongoose.connection.db.command({ dbStats: 1 }),
//     ]);

//     const sizeMB =
//       ((dbStats?.dataSize || 0) + (dbStats?.indexSize || 0)) / (1024 * 1024);
//     const storageLimitMB = 512; // Standard Atlas Free Tier limit
//     const percentUsed = (sizeMB / storageLimitMB) * 100;

//     const stats = {
//       inventory: {
//         totalAssets: assets.length,
//         activeEmployees,
//         brokenAssets: brokenCount,
//         needsMaintenance: assets.filter((a) => a.needsMaintenance).length,
//         totalValue: assets.reduce(
//           (sum, asset) => sum + (asset.purchasePrice || 0),
//           0,
//         ),
//       },
//       systemHealth: {
//         dbUsedMB: `${sizeMB.toFixed(2)} MB`,
//         usagePercent: `${percentUsed.toFixed(1)}%`,
//         isNearLimit: percentUsed > 80,
//       },
//     };

//     res.status(200).json({ status: "success", data: stats });
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Export audit logs to CSV and optionally purge
//  * @access  Admin Only
//  */
// export const archiveAndPurgeLogs = async (req, res, next) => {
//   try {
//     const { confirmPurge } = req.body;

//     const logs = await AuditLog.find()
//       .populate("performedBy targetEmployee", "name email")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!logs.length) return next(new AppError("No audit logs found.", 404));

//     // Formatted specifically for a clean CSV layout
//     const formattedLogs = logs.map((log) => ({
//       timestamp: log.createdAt,
//       action: log.action,
//       entityType: log.entityType,
//       performedBy: log.performedBy?.name || "System",
//       targetEmployee: log.targetEmployee?.name || "N/A",
//       description: log.description,
//     }));

//     const fields = [
//       "timestamp",
//       "action",
//       "entityType",
//       "performedBy",
//       "targetEmployee",
//       "description",
//     ];
//     const parser = new Parser({ fields });
//     const csv = parser.parse(formattedLogs);

//     if (confirmPurge === true) {
//       await AuditLog.deleteMany({});
//     }

//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=audit_archive_${Date.now()}.csv`,
//     );

//     res.status(200).send(csv);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Generate Password Reset Token (Admin/Self flow)
//  * @access  Public (Requires valid email)
//  */
// export const forgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const employee = await Employee.findOne({ email });

//     if (!employee) {
//       return next(
//         new AppError("There is no user with that email address.", 404),
//       );
//     }

//     // 1. Generate token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // 2. Hash and save to DB
//     employee.passwordResetToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     employee.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minute expiry

//     await employee.save({ validateBeforeSave: false });

//     // 3. For Dev: Log the URL to the console
//     const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
//     console.log(`🔗 Password Reset Link: ${resetURL}`);

//     res.status(200).json({
//       status: "success",
//       message:
//         "Password reset link generated. Check console for development URL.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Reset Password with Token
//  * @access  Public
//  */
// export const resetPasswordWithToken = async (req, res, next) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     // 1. Hash the token from the URL to compare with DB
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//     // 2. Find user with valid token and expiry
//     const employee = await Employee.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!employee) {
//       return next(new AppError("Token is invalid or has expired", 400));
//     }

//     // 3. Set new password and clear reset fields
//     employee.password = password;
//     employee.passwordResetToken = undefined;
//     employee.passwordResetExpires = undefined;

//     // Crucial: Reset the force-change flag
//     employee.passwordResetRequired = false;

//     await employee.save();

//     res.status(200).json({
//       status: "success",
//       message: "Password updated successfully! You can now log in.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };
// import { Parser } from "json2csv";
// import mongoose from "mongoose";
// import AuditLog from "../models/AuditLog.js";
// import Asset from "../models/Asset.js";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";

// /**
//  * @desc    Get system-wide stats and DB health
//  * @route   GET /api/admin/system/stats
//  * @access  Admin Only
//  */
// export const getSystemStats = async (req, res, next) => {
//   try {
//     const [assets, activeEmployees, brokenCount, dbStats] = await Promise.all([
//       Asset.find({ isDeleted: { $ne: true } }).lean(),
//       Employee.countDocuments({ status: "ACTIVE" }),
//       Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
//       mongoose.connection.db.command({ dbStats: 1 }),
//     ]);

//     // DB Size Calculation (Data + Indexes)
//     const sizeMB =
//       ((dbStats?.dataSize || 0) + (dbStats?.indexSize || 0)) / (1024 * 1024);
//     const storageLimitMB = 512;
//     const percentUsed = (sizeMB / storageLimitMB) * 100;

//     res.status(200).json({
//       status: "success",
//       data: {
//         inventory: {
//           totalAssets: assets.length,
//           activeEmployees,
//           brokenAssets: brokenCount,
//           needsMaintenance: assets.filter((a) => a.needsMaintenance).length,
//           totalValue: assets.reduce(
//             (sum, asset) => sum + (asset.purchasePrice || 0),
//             0,
//           ),
//         },
//         systemHealth: {
//           dbUsedMB: `${sizeMB.toFixed(2)} MB`,
//           usagePercent: `${percentUsed.toFixed(1)}%`,
//           isNearLimit: percentUsed > 80,
//         },
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Export audit logs to CSV and optionally purge
//  * @route   POST /api/admin/system/archive-logs
//  * @access  Admin Only
//  */
// export const archiveAndPurgeLogs = async (req, res, next) => {
//   try {
//     const { confirmPurge } = req.body;

//     const logs = await AuditLog.find()
//       .populate("performedBy targetEmployee", "name email")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!logs.length) return next(new AppError("No audit logs found.", 404));

//     // Flatten for CSV
//     const fields = [
//       "createdAt",
//       "action",
//       "entityType",
//       "performedBy.name",
//       "targetEmployee.name",
//       "description",
//     ];
//     const parser = new Parser({ fields });
//     const csv = parser.parse(logs);

//     if (confirmPurge === true) {
//       await AuditLog.deleteMany({});
//     }

//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=audit_${Date.now()}.csv`,
//     );
//     res.status(200).send(csv);
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Generate Password Reset Token using Model Methods
//  * @route   POST /api/admin/forgot-password
//  * @access  Public
//  */
// export const forgotPassword = async (req, res, next) => {
//   try {
//     const employee = await Employee.findOne({ email: req.body.email });

//     if (!employee) {
//       return next(new AppError("No user found with that email address.", 404));
//     }

//     // Use the instance method from the Employee model
//     const resetToken = employee.createPasswordResetToken();

//     // Save without validation to allow saving tokens without providing full employee data
//     await employee.save({ validateBeforeSave: false });

//     const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
//     console.log(`🔗 Recovery URL: ${resetURL}`);

//     res.status(200).json({
//       status: "success",
//       message: "Reset link generated. In production, this would be emailed.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// /**
//  * @desc    Reset Password with Token
//  * @route   PATCH /api/admin/reset-password/:token
//  * @access  Public
//  */
// export const resetPasswordWithToken = async (req, res, next) => {
//   try {
//     // We still hash the incoming token to find the match in the DB
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const employee = await Employee.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!employee) {
//       return next(new AppError("Token is invalid or has expired", 400));
//     }

//     // Update password and reset flags
//     employee.password = req.body.password;
//     employee.passwordResetToken = undefined;
//     employee.passwordResetExpires = undefined;
//     employee.passwordResetRequired = false;

//     await employee.save();

//     res.status(200).json({
//       status: "success",
//       message:
//         "Password updated! You can now log in with your new credentials.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };
import { Parser } from "json2csv";
import mongoose from "mongoose";
import crypto from "crypto"; // Added missing import
import AuditLog from "../models/AuditLog.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";

/**
 * @desc    Get system-wide stats and DB health
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const [assets, activeEmployees, brokenCount, dbStats] = await Promise.all([
      Asset.find({ isDeleted: { $ne: true } }).lean(),
      Employee.countDocuments({ status: "ACTIVE" }),
      Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
      mongoose.connection.db.command({ dbStats: 1 }),
    ]);

    const sizeMB =
      ((dbStats?.dataSize || 0) + (dbStats?.indexSize || 0)) / (1024 * 1024);
    const storageLimitMB = 512;
    const percentUsed = (sizeMB / storageLimitMB) * 100;

    res.status(200).json({
      status: "success",
      data: {
        inventory: {
          totalAssets: assets.length,
          activeEmployees,
          brokenAssets: brokenCount,
          needsMaintenance: assets.filter((a) => a.needsMaintenance).length,
          totalValue: assets.reduce(
            (sum, asset) => sum + (asset.purchasePrice || 0),
            0,
          ),
        },
        systemHealth: {
          dbUsedMB: `${sizeMB.toFixed(2)} MB`,
          usagePercent: `${percentUsed.toFixed(1)}%`,
          isNearLimit: percentUsed > 80,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Export audit logs to CSV and optionally purge
 */
export const archiveAndPurgeLogs = async (req, res, next) => {
  try {
    const { confirmPurge } = req.body;

    const logs = await AuditLog.find()
      .populate("performedBy targetEmployee", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!logs.length) return next(new AppError("No audit logs found.", 404));

    const fields = [
      "createdAt",
      "action",
      "entityType",
      "performedBy.name",
      "targetEmployee.name",
      "description",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);

    if (confirmPurge === true) {
      await AuditLog.deleteMany({});
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audit_${Date.now()}.csv`,
    );
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate Password Reset Token
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.body.email });
    if (!employee)
      return next(new AppError("No user found with that email address.", 404));

    const resetToken = employee.createPasswordResetToken();
    await employee.save({ validateBeforeSave: false });

    // In a real app, you would use a mail service here.
    // For now, we log it to the console for development testing.
    const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
    console.log(`🔗 Recovery URL: ${resetURL}`);

    res.status(200).json({
      status: "success",
      message: "Reset link generated. Check server console for the link.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reset Password with Token
 */
export const resetPasswordWithToken = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const employee = await Employee.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!employee)
      return next(new AppError("Token is invalid or has expired", 400));

    employee.password = req.body.password;
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    employee.passwordResetRequired = false;

    await employee.save();

    res.status(200).json({
      status: "success",
      message: "Password updated! You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};
