import axios from "axios";

/**
 * Axios Instance Configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Crucial for receiving/sending HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh State Management
let isRefreshing = false;
let failedQueue = [];

/**
 * Process the failed request queue after a refresh attempt.
 * @param {Error|null} error
 * @param {string|null} token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor: Attach Bearer Token & Prevent GET Caching
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache busting for IE/Legacy browsers on GET requests
    if (config.method?.toLowerCase() === "get") {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor: Handle Token Refresh (401) and Access Denied (403)
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Define auth-related paths that shouldn't trigger a refresh loop
    const authPaths = ["/auth/login", "/auth/refresh", "/auth/me"];
    const isAuthPath = authPaths.some((path) =>
      originalRequest.url?.endsWith(path),
    );

    /**
     * CASE 1: 401 Unauthorized (Token Expired)
     */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthPath
    ) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to get a new access token using the refresh cookie
        const { data } = await api.post("/auth/refresh");
        const newToken = data.accessToken;

        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed (Session likely expired/revoked)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-logout"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /**
     * CASE 2: 403 Forbidden (RBAC or Security Enforcements)
     */
    if (error.response?.status === 403) {
      const message = error.response?.data?.message || "";

      // Specific check for the Password Reset middleware requirement
      if (
        message.toLowerCase().includes("password") &&
        message.toLowerCase().includes("change")
      ) {
        // We don't logout, just force them to the reset view
        window.location.href = "/reset-password";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
