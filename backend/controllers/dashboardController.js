
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import Consumable from "../models/Consumable.js";
import AuditLog from "../models/AuditLog.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /api/dashboard/admin
 * @access  Admin
 */
export const getAdminDashboard = catchAsync(async (req, res) => {
  // Fetch all required data in parallel for performance
  const [activeEmployees, assetStats, lowStockConsumables, recentActivity] =
    await Promise.all([
      // Count active employees (exclude offboarded)
      Employee.countDocuments({ status: "ACTIVE" }),

      // Aggregate asset stats by status
      Asset.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Consumables that are low in stock
      Consumable.aggregate([
        {
          $addFields: {
            currentStock: {
              $subtract: [
                "$totalQuantity",
                { $add: ["$assignedQuantity", { $ifNull: ["$maintenanceQuantity", 0] }] },
              ],
            },
          },
        },
        {
          $match: {
            $expr: {
              $lte: ["$currentStock", { $ifNull: ["$lowStockThreshold", 5] }],
            },
          },
        },
        { $project: { itemName: 1, currentStock: 1, totalQuantity: 1 } },
      ]),

      // Recent activity logs
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("performedBy", "name roleAccess")
        .populate("targetEmployee", "name")
        .populate("entityId") // optional: Asset/Consumable details
        .lean(),
    ]);

  // Map asset stats for frontend
  const assetCounts = {
    TOTAL: assetStats.reduce((acc, curr) => acc + curr.count, 0),
    READY_TO_DEPLOY: assetStats.find((a) => a._id === "READY_TO_DEPLOY")?.count || 0,
    ALLOCATED: assetStats.find((a) => a._id === "ALLOCATED")?.count || 0,
    UNDER_MAINTENANCE: assetStats.find((a) => a._id === "UNDER_MAINTENANCE")?.count || 0,
    DECOMMISSIONED: assetStats.find((a) => a._id === "DECOMMISSIONED")?.count || 0,
  };

  // Format audit logs for frontend
  const formattedActivity = recentActivity.map((log) => ({
    id: log._id,
    performedBy: log.performedBy?.name || "System",
    performedByRole: log.performedBy?.roleAccess || "N/A",
    targetEmployee: log.targetEmployee?.name || null,
    action: log.action,
    entityType: log.entityType || null,
    entityId: log.entityId || null,
    description: log.description || "No details provided",
    timestamp: log.timestamp,
    changes: log.changes || null,
    ipAddress: log.ipAddress || "Internal",
  }));

  res.status(200).json({
    status: "success",
    data: {
      summary: {
        employees: activeEmployees,
        assets: assetCounts,
      },
      lowStockItems: lowStockConsumables,
      recentActivity: formattedActivity,
    },
  });
});

/**
 * @desc    Get Staff Personal Dashboard
 * @route   GET /api/dashboard/staff
 * @access  Private
 */
export const getStaffDashboard = catchAsync(async (req, res) => {
  const employeeId = req.user._id;

  // Fetch staff allocated assets and consumables
  const [myAssets, myConsumables] = await Promise.all([
    Asset.find({ allocatedTo: employeeId, isDeleted: { $ne: true } })
      .select("category model serialNumber status updatedAt")
      .lean(),
    Consumable.find({ "assignments.employeeId": employeeId })
      .select("itemName assignments.$")
      .lean(),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      allocatedAssets: myAssets || [],
      consumables: (myConsumables || []).map((item) => ({
        name: item.itemName,
        quantity: item.assignments[0]?.quantity || 0,
      })),
    },
  });
});
