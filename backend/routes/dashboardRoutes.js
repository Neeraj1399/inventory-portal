// import { Router } from "express";
// const router = Router();
// import { protect, isAdmin } from "../middleware/authMiddleware.js";
// import {
//   getAdminDashboard,
//   getStaffDashboard,
// } from "../controllers/dashboardController.js";

// // --- MIDDLEWARE ---
// router.use(protect); // Every dashboard requires a login

// /**
//  * @desc    Admin: Full Inventory, Maintenance Alerts, & Recent Activity
//  */
// router.get("/admin", isAdmin, getAdminDashboard);

// /**
//  * @desc    Staff: Their assigned assets, recent consumables, and profile
//  */
// router.get("/staff", getStaffDashboard);

// export default router;
import { Router } from "express";
const router = Router();
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminDashboard,
  getStaffDashboard,
} from "../controllers/dashboardController.js";

// --- PROTECT ALL ROUTES ---
router.use(protect);

/**
 * @desc    Admin Dashboard
 * @access  Admin only
 */
router.get("/admin", isAdmin, getAdminDashboard);

/**
 * @desc    Staff Dashboard
 * @access  Accessible by Staff AND Admins
 */
router.get(
  "/staff",
  (req, res, next) => {
    // Allow if roleAccess is ADMIN or STAFF
    if (req.user.roleAccess === "ADMIN" || req.user.roleAccess === "STAFF") {
      return getStaffDashboard(req, res, next);
    }

    res.status(403).json({
      status: "fail",
      message: "You do not have permission to perform this action",
    });
  },
  getStaffDashboard,
);

export default router;
