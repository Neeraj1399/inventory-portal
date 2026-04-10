import api from "../services/api";


export const getAuditLogs = async (page = 1, limit = 50, filters = {}) => {
  try {
    const { search, action, user, entityType, date } = filters;
    const response = await api.get("/audit-logs", {
      params: { page, limit, search, action, user, entityType, date }
    });
    return response.data;
  } catch (err) {
    console.error("Failed to fetch audit logs", err);
    throw err;
  }
};
