import axios from "axios";

/**
 * Axios Instance Configuration
 */
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (!envURL) return "http://localhost:5000/api";
  
  // Ensure the URL ends with /api (without double slashes)
  return envURL.replace(/\/$/, "") + (envURL.includes("/api") ? "" : "/api");
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
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
        localStorage.clear();
        
        // Dispatch global event for AuthProvider to sync state
        window.dispatchEvent(new Event("auth-logout"));

        // Prevent redirect loops if already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }

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

    /**
     * CASE 3: Unhandled 500+ or Generic Errors
     */
    if (error.response?.status >= 500 && !originalRequest.silent) {
      // We use a custom event because we can't easily use hooks/context here
      const event = new CustomEvent("api-error", {
        detail: {
          message: error.response?.data?.message || "Internal server error. Please try again later.",
          type: "error"
        }
      });
      window.dispatchEvent(event);
    }

    return Promise.reject(error);
  },
);

export default api;
