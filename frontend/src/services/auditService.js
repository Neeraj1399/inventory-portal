import api from "../hooks/api";


export const getAuditLogs = async () => {
  try {
    const response = await api.get("/audit-logs");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch audit logs", err);
    throw err;
  }
};
