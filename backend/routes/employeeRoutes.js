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
 * @desc    Get current user's profile and allocated asset counts
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
 * @desc    Report an allocated asset as broken/malfunctioning
 * @route   PATCH /api/employees/report-issue/:id
 */
router.patch("/report-issue/:id",reportAssetIssue);

/**
 * @desc    Formally request a password reset from the Admin
 * @route   POST /api/employees/request-reset
 */
router.post("/request-reset", requestPasswordReset);

export default router;
