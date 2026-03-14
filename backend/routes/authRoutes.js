// import express from "express";
// const router = express.Router();
// import {
//   login,
//   logout,
//   protect,
//   updatePassword,
// } from "../controllers/authController.js";

// /**
//  * @desc    Standard Login
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// // Pro Tip: Apply rate limiting here to stop hackers from guessing passwords
// router.post("/login", login);
// router.patch("/update-password", protect, updatePassword);
// /**
//  * @desc    Logout / Clear Session
//  * @route   POST /api/auth/logout
//  * @access  Public (or Protected)
//  */
// router.post("/logout", logout);

// export default router;
// import express from "express";
// const router = express.Router();
// import { login, refresh, logout, updatePassword, getMe } from "../controllers/authController.js";
// import { protect } from "../middleware/authMiddleware.js"; // //update: Corrected path

// router.post("/login", login);
// router.post("/refresh", refresh); // //update: New endpoint for silent refresh
// router.post("/logout", protect, logout); // //update: Better to protect logout

// // Routes that require being logged in
// router.use(protect);
// router.patch("/update-password", updatePassword);
// router.get("/me", protect, getMe);

// export default router;
import express from "express";
const router = express.Router();
import {
  login,
  refresh,
  logout,
  updatePassword,
  getMe,
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
