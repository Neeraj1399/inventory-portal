import { Parser } from "json2csv";
import mongoose from "mongoose";
import crypto from "crypto"; // Added missing import
import AuditLog from "../models/AuditLog.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";

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
    employee.resetRequested = false; // Admin has processed the request
    await employee.save({ validateBeforeSave: false });

    // In a real app, you would use a mail service here.
    // We log it to the console for development testing.
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    console.log(`🔗 Recovery URL: ${resetURL}`);

    try {
      await sendEmail({
        email: employee.email,
        subject: "Your Password Reset Link (Valid for 10 minutes)",
        message: `Your IT Administrator has approved your password reset request. Click this link to proceed: ${resetURL}\n\nIf you did not request this, please ignore this email.`,
      });

      res.status(200).json({
        status: "success",
        message: "Reset link generated and emailed to the user.",
      });
    } catch (err) {
      employee.passwordResetToken = undefined;
      employee.passwordResetExpires = undefined;
      await employee.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later.",
          500,
        ),
      );
    }
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
      message: "Password modified! You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all employees with pending password reset requests
 */
export const getResetRequests = async (req, res, next) => {
  try {
    const requests = await Employee.find({ resetRequested: true }).select(
      "name email department role level type"
    );

    res.status(200).json({
      status: "success",
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

