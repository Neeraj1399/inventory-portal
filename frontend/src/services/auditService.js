import api from "../services/api";


export const getAuditLogs = async (page = 1, limit = 50) => {
  try {
    const response = await api.get("/audit-logs", {
      params: { page, limit }
    });
    return response.data;
  } catch (err) {
    console.error("Failed to fetch audit logs", err);
    throw err;
  }
};
