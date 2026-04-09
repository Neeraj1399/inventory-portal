import { Parser } from "json2csv";
import mongoose from "mongoose";
import crypto from "crypto";
import AuditLog from "../models/AuditLog.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import sendEmail from "../utils/email.js";

/**
 * @desc    Get system-wide stats and DB health
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const [assetStats, activeEmployees, brokenCount, dbStats] = await Promise.all([
      Asset.aggregate([
        {
          $group: {
            _id: null,
            totalAssets: { $sum: 1 },
            totalValue: { $sum: { $ifNull: ["$purchasePrice", 0] } },
          },
        },
      ]),
      Employee.countDocuments({ status: "ACTIVE" }),
      Asset.countDocuments({ status: "BROKEN" }),
      mongoose.connection.db.command({ dbStats: 1 }),
    ]);

    const stats = assetStats[0] || { totalAssets: 0, totalValue: 0 };
    const sizeMB = ((dbStats?.dataSize || 0) + (dbStats?.indexSize || 0)) / (1024 * 1024);

    res.status(200).json({
      status: "success",
      data: {
        inventory: {
          totalAssets: stats.totalAssets,
          activeEmployees,
          brokenAssets: brokenCount,
          totalValue: stats.totalValue,
        },
        systemHealth: {
          dbUsedMB: `${sizeMB.toFixed(2)} MB`,
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
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!logs.length) return res.status(404).json({ message: "No audit logs found." });

    const fields = ["createdAt", "action", "entityType", "description"];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);

    if (confirmPurge === true) {
      await AuditLog.deleteMany({});
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit_${Date.now()}.csv`);
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
    if (!employee) return res.status(404).json({ message: "No user found with that email." });

    const resetToken = employee.createPasswordResetToken();
    await employee.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: employee.email,
        subject: "Password Reset Link",
        message: `Click here to reset: ${resetURL}`,
      });
      res.status(200).json({ status: "success", message: "Email sent." });
    } catch (err) {
      employee.passwordResetToken = undefined;
      employee.passwordResetExpires = undefined;
      await employee.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email failed to send." });
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
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const employee = await Employee.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!employee) return res.status(400).json({ message: "Token invalid or expired." });

    employee.password = req.body.password;
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    await employee.save();

    res.status(200).json({ status: "success", message: "Password reset." });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all employees with pending password reset requests
 */
export const getResetRequests = async (req, res, next) => {
  try {
    const requests = await Employee.find({ resetRequested: true });
    res.status(200).json({ status: "success", data: requests });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject / Clear a password reset request
 */
export const rejectResetRequest = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { resetRequested: false });
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.status(200).json({ status: "success" });
  } catch (err) {
    next(err);
  }
};

