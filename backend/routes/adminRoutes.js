import express from "express";
const router = express.Router();

// 1. System-wide & Auth Logic (from adminController.js)
import {
  getSystemStats,
  archiveAndPurgeLogs,
  forgotPassword,
  resetPasswordWithToken,
  getResetRequests,
} from "../controllers/adminController.js";

// 2. Employee Management Logic (from employeeController.js)
// Note: We keep employee logic in the employee controller,
// but protect the routes here so only Admins can use them.
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  offboardEmployee,
} from "../controllers/employeeController.js";

// 3. Middleware
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// --- PUBLIC / RECOVERY ROUTES ---
// These do not require 'isAdmin' because the user is logged out
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPasswordWithToken);

// --- PROTECTED ADMIN-ONLY ROUTES ---
// Everything below this line requires:
// 1. A valid JWT (protect)
// 2. roleAccess === 'ADMIN' (isAdmin)
router.use(protect, isAdmin);

// Employee Management (Admin Dashboard)
router.get("/employees", getEmployees); // GET /api/admin/employees
router.post("/employees", createEmployee); // POST /api/admin/employees
router.patch("/employees/:id", updateEmployee); // PATCH /api/admin/employees/:id
router.patch("/employees/:id/offboard", offboardEmployee); // PATCH /api/admin/employees/:id/offboard

// Reset Requests Dashboard
router.get("/reset-requests", getResetRequests); // GET /api/admin/reset-requests

// System Health & Maintenance
router.get("/stats", getSystemStats); // GET /api/admin/system/stats
router.post("/archive-logs", archiveAndPurgeLogs); // POST /api/admin/system/archive-logs

export default router;
