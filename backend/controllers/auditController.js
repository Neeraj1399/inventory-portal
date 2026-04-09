import AuditLog from "../models/AuditLog.js";

/**
 * @desc    Get all audit logs
 */
export const getAllAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const { search, action, user: userFilter, entityType } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userFilter) query.performedBy = userFilter;

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { entityType: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "name")
      .populate("targetEmployee", "name");

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      status: "success",
      total,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

