import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollManager from "./components/common/ScrollManager";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/PageTransition";

// Eagerly loaded: needed immediately on app start
import Login from "./pages/Login/Login";
import ResetPassword from "./pages/employees/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy-loaded: fetched only when the user navigates to these pages
const AdminDashboard = lazy(() => import("./pages/employees/AdminDashboard"));
const StaffDashboard = lazy(() => import("./pages/Login/StaffDashboard"));
const AssetList = lazy(() => import("./pages/assets/AssetList"));
const ConsumableList = lazy(() => import("./pages/consumables/ConsumableList"));
const EmployeeList = lazy(() => import("./pages/employees/EmployeeList"));
const RequestList = lazy(() => import("./pages/requests/RequestList"));
const RequestDashboard = lazy(() => import("./pages/requests/RequestDashboard"));
const AuditLogs = lazy(() => import("./pages/audit/AuditLogs"));

/**
 * --- APP CONTENT ---
 */
function AppContent() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Connection Re-established. Syncing...", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Local mode active. Checking connectivity...", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  // 1. Loading State
  if (loading) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex flex-col items-center justify-center bg-bg-primary gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin shadow-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-ping" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.3em] text-text-primary">Athiva Matrix</span>
            <span className="text-[9px] font-black tracking-widest text-text-muted opacity-60">Synchronizing Environment...</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Router>
      <ScrollManager />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        
        {/* NEW: Forgot Password Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* MODIFIED: Added optional :token for Email Resets */}
        <Route path="/reset-password/:token?" element={<ResetPassword />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Suspense
                fallback={
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="min-h-screen flex flex-col items-center justify-center bg-bg-primary gap-6"
                    >
                      <div className="w-10 h-10 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin shadow-glow-sm" />
                      <span className="text-[9px] font-black tracking-widest text-text-disabled opacity-40">Loading Module...</span>
                    </motion.div>
                }
              >
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              user?.roleAccess === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <StaffDashboard />
              )
            }
          />

          {/* Shared Modules */}
          <Route path="assets" element={<AssetList />} />
          <Route path="consumables" element={<ConsumableList />} />
          <Route path="requests" element={<RequestList />} />
          <Route path="requests/stats" element={user?.roleAccess === "ADMIN" ? <RequestDashboard /> : <Navigate to="/requests" />} />

          {/* Admin-Only Management */}
          <Route
            path="employees"
            element={
              user?.roleAccess === "ADMIN" ? (
                <EmployeeList />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Audit Logs - Strictly Admin only */}
          <Route
            path="audit-logs"
            element={
              user?.roleAccess === "ADMIN" ? (
                <AuditLogs />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

/**
 * --- PROTECTED ROUTE WRAPPER ---
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Enforce password reset first
  if (user.passwordResetRequired) {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
};

/**
 * --- ROOT APP ---
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-screen bg-bg-primary text-text-secondary antialiased"
          >
            <AppContent />
          </motion.div>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
