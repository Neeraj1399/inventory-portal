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
import express from "express";
const router = express.Router();
import { login, refresh, logout, updatePassword, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // //update: Corrected path

router.post("/login", login);
router.post("/refresh", refresh); // //update: New endpoint for silent refresh
router.post("/logout", protect, logout); // //update: Better to protect logout

// Routes that require being logged in
router.use(protect);
router.patch("/update-password", updatePassword);
router.get("/me", protect, getMe);

export default router;
