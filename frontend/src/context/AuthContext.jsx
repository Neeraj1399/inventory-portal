import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../hooks/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Hydration Logic
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      try {
        // This call will return 401 if logged out, but our
        // new interceptor logic will now ignore it!
        const { data: resBody } = await api.get("/auth/me");
        if (resBody.data?.user) {
          login(resBody.data.user, localStorage.getItem("token"));
        }
      } catch (err) {
        // It's totally fine to fail here; it just means no one is logged in.
        console.log("No session to restore.");
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login: Updates state and local storage
   */
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  /**
   * Logout: Clears state, LocalStorage, and Backend Cookies
   */
  const logout = async (notifyBackend = true) => {
    try {
      if (notifyBackend) {
        await api.post("/auth/logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
