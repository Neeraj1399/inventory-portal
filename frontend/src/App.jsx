import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

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
const AuditLogs = lazy(() => import("./pages/audit/AuditLogs"));

/**
 * --- APP CONTENT ---
 */
function AppContent() {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
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
                  <div className="min-h-screen flex items-center justify-center bg-zinc-900">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
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
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}