import AuditLog from "../models/AuditLog.js";
import Employee from "../models/Employee.js";

/**
 * @desc    Get all audit logs
 */
export const getAllAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const { search, action, user: userFilter, entityType, date } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userFilter) {
      const emp = await Employee.findOne({ name: userFilter }, "_id");
      if (emp) query.performedBy = emp._id;
      else query.performedBy = null; // No matching user, return no logs
    }

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      query.timestamp = { $gte: start, $lte: end };
    }

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

