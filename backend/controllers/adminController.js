// import { Parser } from "json2csv";
// import mongoose from "mongoose"; // Added for DB stats
// import AuditLog from "../models/AuditLog.js";
// import Asset from "../models/Asset.js";
// import Employee from "../models/Employee.js";
// import AppError from "../utils/appError.js";

// /**
//  * @desc    Export logs to CSV and purge DB to save Atlas space
//  * @route   POST /api/admin/system/archive-logs
//  */
// export const archiveAndPurgeLogs = async (req, res, next) => {
//   try {
//     const { confirmPurge } = req.body;

//     const logs = await AuditLog.find()
//       .populate("performedBy", "name email")
//       .populate("targetEmployee", "name")
//       .lean();

//     if (!logs.length) return next(new AppError("No logs to archive", 404));

//     // 1. Prepare CSV
//     const fields = [
//       "timestamp",
//       "action",
//       "entityType",
//       "performedBy.name",
//       "description",
//     ];
//     const parser = new Parser({ fields });
//     const csv = parser.parse(logs);

//     // 2. Purge BEFORE response if confirmed
//     if (confirmPurge === true) {
//       await AuditLog.deleteMany({});
//     }

//     // 3. Send File
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
//  * @desc    Global System Stats + Atlas Health Check
//  * @route   GET /api/admin/system/stats
//  */
// export const getSystemStats = async (req, res, next) => {
//   try {
//     // 1. Fetch data and DB health in parallel
//     const [assets, activeEmployees, brokenCount, dbRawStats] =
//       await Promise.all([
//         Asset.find({ isDeleted: { $ne: true } }).lean(), // Filter out soft-deleted
//         Employee.countDocuments({ status: "ACTIVE" }),
//         Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
//         mongoose.connection.db.command({ dbStats: 1 }), // ATLAS HEALTH CHECK
//       ]);

//     // 2. Calculate Storage Usage (Atlas Free Tier is 512MB)
//     const sizeInBytes = dbRawStats.dataSize + dbRawStats.indexSize;
//     const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
//     const storageLimit = 512;
//     const percentUsed = ((sizeInMB / storageLimit) * 100).toFixed(1);

//     const stats = {
//       inventory: {
//         totalAssets: assets.length,
//         activeEmployees,
//         brokenAssets: brokenCount,
//         needsMaintenance: assets.filter((a) => a.needsMaintenance).length,
//         totalValue: assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0),
//       },
//       systemHealth: {
//         dbUsedMB: `${sizeInMB} MB`,
//         dbLimitMB: `${storageLimit} MB`,
//         usagePercent: `${percentUsed}%`,
//         isNearLimit: percentUsed > 80, // Alert flag for Frontend
//       },
//     };

//     res.status(200).json({ status: "success", data: stats });
//   } catch (err) {
//     next(err);
//   }
// };
import { Parser } from "json2csv";
import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import AppError from "../utils/appError.js";

/**
 * @desc    Export logs to CSV and optionally purge them
 * @route   POST /api/admin/system/archive-logs
 * @access  Admin
 */
export const archiveAndPurgeLogs = async (req, res, next) => {
  try {
    const { confirmPurge } = req.body;

    const logs = await AuditLog.find()
      .populate("performedBy", "name email")
      .populate("targetEmployee", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!logs.length) {
      return next(new AppError("No logs available to archive", 404));
    }

    // Flatten data for CSV
    const formattedLogs = logs.map((log) => ({
      timestamp: log.createdAt,
      action: log.action,
      entityType: log.entityType,
      performedBy: log.performedBy?.name || "System",
      performedByEmail: log.performedBy?.email || "",
      targetEmployee: log.targetEmployee?.name || "",
      description: log.description,
    }));

    const fields = [
      "timestamp",
      "action",
      "entityType",
      "performedBy",
      "performedByEmail",
      "targetEmployee",
      "description",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(formattedLogs);

    // Purge logs if confirmed
    if (confirmPurge === true) {
      await AuditLog.deleteMany({});
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audit_log_${Date.now()}.csv`,
    );

    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Global System Stats + Atlas Health Check
 * @route   GET /api/admin/system/stats
 * @access  Admin
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const [assets, activeEmployees, brokenCount, dbStats] = await Promise.all([
      Asset.find({ isDeleted: { $ne: true } }).lean(),
      Employee.countDocuments({ status: "ACTIVE" }),
      Asset.countDocuments({ status: "BROKEN", isDeleted: { $ne: true } }),
      mongoose.connection.db.command({ dbStats: 1 }),
    ]);

    const sizeBytes = dbStats.dataSize + dbStats.indexSize;
    const sizeMB = sizeBytes / (1024 * 1024);

    const storageLimitMB = 512; // Atlas Free Tier
    const percentUsed = (sizeMB / storageLimitMB) * 100;

    const stats = {
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
        dbLimitMB: `${storageLimitMB} MB`,
        usagePercent: `${percentUsed.toFixed(1)}%`,
        isNearLimit: percentUsed > 80,
      },
    };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
