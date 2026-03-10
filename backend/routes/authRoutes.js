import express from "express";
const router = express.Router();
import {
  login,
  logout,
  protect,
  updatePassword,
} from "../controllers/authController.js";
// Optional: import { loginLimiter } from "../middleware/rateLimiter.js";

/**
 * @desc    Standard Login
 * @route   POST /api/auth/login
 * @access  Public
 */
// Pro Tip: Apply rate limiting here to stop hackers from guessing passwords
router.post("/login", login);
router.patch("/update-password", protect, updatePassword);
/**
 * @desc    Logout / Clear Session
 * @route   POST /api/auth/logout
 * @access  Public (or Protected)
 */
router.post("/logout", logout);

export default router;
