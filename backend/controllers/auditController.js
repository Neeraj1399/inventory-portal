// import AuditLog from "../models/AuditLog.js";

// export const getAllAuditLogs = async (req, res) => {
//   try {
//     const logs = await AuditLog.find()
//       .sort({ timestamp: -1 })
//       .populate("performedBy", "name role")
//       .populate("targetEmployee", "name role")
//       .lean();

//     res.status(200).json(logs);
//   } catch (err) {
//     console.error("Failed to fetch audit logs:", err);
//     res.status(500).json({ message: "Failed to fetch audit logs" });
//   }
// };
import AuditLog from "../models/AuditLog.js";

export const getAllAuditLogs = async (req, res) => {
  try {
    // 1. Get pagination parameters from the URL (e.g., /api/logs?page=1&limit=20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 2. Execute Query with Population and Pagination
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 }) // Newest first
      .skip(skip) // Jump over previous pages
      .limit(limit) // Only take a "slice" of data
      .populate("performedBy", "name role")
      .populate("targetEmployee", "name role")
      .populate({
        path: "entityId",
        select: "assetName itemName name", // Dynamic fields: uses whatever matches
      })
      .lean();

    // 3. Get total count (for the Frontend to calculate total pages)
    const totalLogs = await AuditLog.countDocuments();

    res.status(200).json({
      status: "success",
      results: logs.length,
      total: totalLogs,
      pages: Math.ceil(totalLogs / limit),
      currentPage: page,
      data: logs,
    });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
