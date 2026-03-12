import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login/Login";
import ResetPassword from "./pages/employees/ResetPassword";

import AdminDashboard from "./pages/employees/AdminDashboard";
import StaffDashboard from "./pages/employees/StaffDashboard";

import AssetList from "./pages/assets/AssetList";
import ConsumableList from "./pages/consumables/ConsumableList";
import EmployeeList from "./pages/employees/EmployeeList";

import DashboardLayout from "./components/layout/DashboardLayout";
// import { CurrencyProvider } from "./context/CurrencyContext";
// Lazy load AuditLogs for performance
const AuditLogs = lazy(() => import("./pages/audit/AuditLogs"));

/**
 * --- APP CONTENT ---
 * Handles the logic-based routing once Auth state is hydrated
 */
function AppContent() {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* FIX: Check roleAccess instead of role. 
            This ensures Admin stays on Admin view and Staff stays on Staff view.
          */}
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

          {/* Admin-Only Management (Optional check) */}
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
                <Suspense
                  fallback={<div className="p-8 text-center">Loading...</div>}
                >
                  <AuditLogs />
                </Suspense>
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
    <AuthProvider>
      {/* <CurrencyProvider> */}
        <AppContent />
      {/* </CurrencyProvider> */}
    </AuthProvider>
  );
}
