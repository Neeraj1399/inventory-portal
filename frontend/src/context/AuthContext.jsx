// import React, { createContext, useState, useEffect, useContext } from "react";
// import api from "../hooks/api";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Initial Hydration Logic
//   useEffect(() => {
//     const initializeAuth = async () => {
//       const savedUser = localStorage.getItem("user");
//       const token = localStorage.getItem("token");

//       if (savedUser && token) {
//         setUser(JSON.parse(savedUser));
//         setLoading(false);
//         return;
//       }

//       try {
//         // This call will return 401 if logged out, but our
//         // new interceptor logic will now ignore it!
//         const { data: resBody } = await api.get("/auth/me");
//         if (resBody.data?.user) {
//           login(resBody.data.user, localStorage.getItem("token"));
//         }
//       } catch (err) {
//         // It's totally fine to fail here; it just means no one is logged in.
//         console.log("No session to restore.");
//       } finally {
//         setLoading(false); // Stop the loading spinner
//       }
//     };

//     initializeAuth();
//   }, []);

//   /**
//    * Login: Updates state and local storage
//    */
//   const login = (userData, token) => {
//     localStorage.setItem("user", JSON.stringify(userData));
//     localStorage.setItem("token", token);
//     setUser(userData);
//   };

//   /**
//    * Logout: Clears state, LocalStorage, and Backend Cookies
//    */
//   const logout = async (notifyBackend = true) => {
//     try {
//       if (notifyBackend) {
//         await api.post("/auth/logout");
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//       setUser(null);
//       window.location.href = "/login";
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../hooks/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      // 1. If we have both, hydrate the state
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      // 2. If we have a token but NO user, they might be in the middle of a reset
      // or the tab was closed. Let's try to fetch the profile.
      if (token && !savedUser) {
        try {
          const { data: resBody } = await api.get("/auth/me");

          // IMPORTANT: If backend says they must change password,
          // we DON'T set the user state here to keep them restricted.
          if (resBody.data?.user && !resBody.mustChangePassword) {
            login(resBody.data.user, token);
          }
        } catch (err) {
          console.log("Session recovery failed.");
          localStorage.removeItem("token");
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = async (notifyBackend = true) => {
    try {
      if (notifyBackend) await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear(); // Simpler: clear everything
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, setUser, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
