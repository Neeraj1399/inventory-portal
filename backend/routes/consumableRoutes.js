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
  resolveMaintenance,
} from "../controllers/consumableController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

/**
 * --- AUTHENTICATION GUARD ---
 * All users must be logged in to view or interact with consumables.
 */
router.use(protect);

// Public/General Private Routes
router.get("/", getConsumables);
router.get("/:id", getConsumableById);

/**
 * --- ADMIN AUTHORIZATION GUARD ---
 * Only Admins can modify inventory levels, assign items, or manage maintenance.
 * Simplified from (req, res, next) => isAdmin(req, res, next)
 */
router.use(isAdmin);

/**
 * Inventory Lifecycle Management
 */

// 1. Acquisition & Basic Management
router.post("/", createConsumable); // Create new SKU
router.patch("/:id/restock", restockConsumable); // Increase existing stock
router.delete("/:id", deleteConsumable); // Remove SKU permanently

// 2. Employee Assignment Flow
router.post("/:id/assign", assignConsumable); // Issue to employee
router.post("/:id/return", returnConsumable); // Return to warehouse (Stock or Repair)

// 3. Quality & Maintenance Flow
// Handles moving "In-Warehouse" stock to maintenance or scrapping it
router.patch("/:id/condition", updateCondition);

// Handles returning items from the "Maintenance Pool" back to stock or scrapping them
router.patch("/:id/resolve-maintenance", resolveMaintenance);

export default router;
