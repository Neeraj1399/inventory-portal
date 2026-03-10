import api from "../hooks/api"; 

/**
 * Fetch all audit logs from the backend
 * @returns {Promise<Array>} logs
 */
export const getAuditLogs = async () => {
  try {
    const response = await api.get("/audit-logs");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch audit logs", err);
    throw err;
  }
};
