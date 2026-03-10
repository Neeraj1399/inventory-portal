import AuditLog from "../models/AuditLog.js";

export const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .populate("performedBy", "name role")
      .populate("targetEmployee", "name role")
      .lean();

    res.status(200).json(logs);
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};