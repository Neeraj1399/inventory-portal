import { Router } from "express";
const router = Router();
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminDashboard,
  getStaffDashboard,
} from "../controllers/dashboardController.js";

// --- MIDDLEWARE ---
router.use(protect); // Every dashboard requires a login

/**
 * @desc    Admin: Full Inventory, Maintenance Alerts, & Recent Activity
 */
router.get("/admin", isAdmin, getAdminDashboard);

/**
 * @desc    Staff: Their assigned assets, recent consumables, and profile
 */
router.get("/staff", getStaffDashboard);

export default router;
