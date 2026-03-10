import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/* -------------------------------------------
   Request Interceptor
   - Attach auth token
   - Prevent caching on GET requests
-------------------------------------------- */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prevent browser / proxy caching
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* -------------------------------------------
   Response Interceptor
   - Handle session expiry globally
-------------------------------------------- */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    // Ignore auth routes to prevent infinite loop
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/reset-password");

    if (status === 401 && !isAuthRoute) {
      console.warn("Session expired. Logging out user.");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Notify React app
      window.dispatchEvent(new Event("auth-logout"));
    }

    return Promise.reject(error);
  },
);

export default api;
