import express from "express";
const router = express.Router();
import {
  getEmployees,
  createEmployee,
  offboardEmployee,
  updateEmployee,
} from "../controllers/employeeController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// --- GLOBAL MIDDLEWARE ---
// All employee routes require authentication
router.use(protect);

/**
 * @route   GET /api/employees
 * @access  Private (Admin & Staff)
 * @desc    Get the directory of employees
 */
router.get("/", getEmployees);

// --- ADMIN ONLY GUARD ---
// Every route below this line requires Admin privileges
router.use(isAdmin);

//ADD THIS ROUTE HERE
/**
 * @route   PATCH /api/employees/:id
 * @desc    Update employee details
 */
router.patch("/:id", updateEmployee);

/**
 * @route   POST /api/employees
 * @desc    Register a new employee (Password hashing is handled in Model)
 */
router.post("/", createEmployee);

/**
 * @route   PATCH /api/employees/:id/offboard
 * @desc    Triggers full offboarding service (unassigns assets, logs action)
 */
router.patch("/:id/offboard", offboardEmployee);

export default router;
