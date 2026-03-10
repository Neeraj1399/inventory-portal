// import express from "express";
// const router = express.Router();
// import {
//   getConsumables,
//   getConsumableById,
//   createConsumable,
//   assignConsumable,
// } from "../controllers/consumableController.js";
// import { protect, isAdmin } from "../middleware/authMiddleware.js";

// // --- AUTHENTICATION GUARD ---
// router.use(protect);

// /**
//  * @desc    View Inventory (Staff can see what's available, Admins see all)
//  */
// router.get("/", getConsumables);
// router.get("/:id", getConsumableById);

// // --- ADMIN AUTHORIZATION GUARD ---
// router.use(isAdmin);

// /**
//  * @desc    Inventory Management
//  */
// router.post("/", createConsumable);
// router.post("/:id/assign", assignConsumable);

// export default router;
import express from "express";
const router = express.Router();
import {
  getConsumables,
  getConsumableById,
  createConsumable,
  assignConsumable,
  restockConsumable,
  returnConsumable, // 1. Added this import
} from "../controllers/consumableController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// --- AUTHENTICATION GUARD ---
router.use(protect);

/**
 * @desc    View Inventory (Staff can see what's available, Admins see all)
 */
router.get("/", getConsumables);
router.get("/:id", getConsumableById);

// --- ADMIN AUTHORIZATION GUARD ---
router.use((req, res, next) => isAdmin(req, res, next));

/**
 * @desc    Inventory Management
 */
router.post("/", createConsumable);
router.post("/:id/assign", assignConsumable);
router.post("/:id/return", returnConsumable); // 2. Added this route
router.patch("/:id/restock", restockConsumable);

export default router;
