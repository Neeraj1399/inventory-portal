// import express from "express";
// const router = express.Router();
// import {
//   getEmployees,
//   createEmployee,
//   offboardEmployee,
//   updateEmployee,
// } from "../controllers/employeeController.js";
// import { protect, isAdmin } from "../middleware/authMiddleware.js";

// // --- GLOBAL MIDDLEWARE ---
// // All employee routes require authentication
// router.use(protect);

// /**
//  * @route   GET /api/employees
//  * @access  Private (Admin & Staff)
//  * @desc    Get the directory of employees
//  */
// router.get("/", getEmployees);

// /**
//  * @route   PATCH /api/employees/:id
//  * @desc    Update employee details
//  */
// router.patch("/:id", updateEmployee);

// // --- ADMIN ONLY GUARD ---
// // Every route below this line requires Admin privileges
// router.use(isAdmin);

// /**
//  * @route   POST /api/employees
//  * @desc    Register a new employee (Password hashing is handled in Model)
//  */
// router.post("/", createEmployee);

// /**
//  * @route   PATCH /api/employees/:id/offboard
//  * @desc    Triggers full offboarding service (unassigns assets, logs action)
//  */
// router.patch("/:id/offboard", offboardEmployee);

// export default router;
import express from "express";
const router = express.Router();
import {
  getMyProfile,
  updateMe,
  requestItem, // Ensure this name matches your controller export
 reportAssetIssue, // Ensure this name matches your controller export
  requestPasswordReset,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";

// --- GLOBAL MIDDLEWARE ---
// Every route in this file requires a valid JWT Access Token
router.use(protect);

/**
 * @desc    Get current user's profile and assigned asset counts
 * @route   GET /api/employees/me
 */
router.get("/me", getMyProfile);

/**
 * @desc    Update personal details (name, email)
 * @route   PATCH /api/employees/update-me
 */
router.patch("/update-me", updateMe);

/**
 * @desc    Request a new asset or consumable
 * @route   POST /api/employees/request-item
 */
router.post("/request-item", requestItem);

/**
 * @desc    Report an assigned asset as broken/malfunctioning
 * @route   PATCH /api/employees/report-issue/:id
 */
router.patch("/report-issue/:id",reportAssetIssue);

/**
 * @desc    Formally request a password reset from the Admin
 * @route   POST /api/employees/request-reset
 */
router.post("/request-reset", requestPasswordReset);

export default router;
