import express from "express";
const router = express.Router();
import {
  login,
  refresh,
  logout,
  updatePassword,
  getMe,
  requestPasswordReset,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

// --- PUBLIC ROUTES ---

/**
 * @desc   Standard Login (Generates Access & Refresh tokens)
 * @route  POST /api/auth/login
 */
router.post("/login", login);

/**
 * @desc   Silent Refresh (Generates new Access Token via Refresh Cookie)
 * @route  POST /api/auth/refresh
 */
router.post("/refresh", refresh);

/**
 * @desc   Staff Requests Password Reset
 * @route  POST /api/auth/forgot-password-request
 */
router.post("/forgot-password-request", requestPasswordReset);

// --- PROTECTED ROUTES ---
// All routes defined below this middleware require a valid Access Token
router.use(protect);

/**
 * @desc   Logout (Clears cookies and invalidates DB refresh token)
 * @route  POST /api/auth/logout
 */
router.post("/logout", logout);

/**
 * @desc   Get Current User Profile
 * @route  GET /api/auth/me
 */
router.get("/me", getMe);

/**
 * @desc   Self-Service Password Update
 * @route  PATCH /api/auth/update-password
 */
router.patch("/update-password", updatePassword);

export default router;
