import express from "express";
const router = express.Router();
import {
  getConsumables,
  getConsumableById,
  createConsumable,
  assignConsumable,
  restockConsumable,
  returnConsumable,
  deleteConsumable,
  updateCondition,
  resolveMaintenance
} from "../controllers/consumableController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// --- AUTHENTICATION GUARD ---
router.use(protect);

router.get("/", getConsumables);
router.get("/:id", getConsumableById);

// --- ADMIN AUTHORIZATION GUARD ---
router.use((req, res, next) => isAdmin(req, res, next));

/**
 * Inventory Management
 */
router.post("/", createConsumable);
router.post("/:id/assign", assignConsumable);
router.post("/:id/return", returnConsumable);
router.patch("/:id/restock", restockConsumable);

// 2. REGISTER THE CONDITION ROUTE
// This matches the frontend call: PATCH /api/consumables/:id/condition
router.patch("/:id/condition", updateCondition);
router.patch("/:id/resolve-maintenance", resolveMaintenance);
router.delete("/:id", deleteConsumable);

export default router;
