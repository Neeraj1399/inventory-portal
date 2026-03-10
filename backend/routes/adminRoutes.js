import express from "express";
const router = express.Router();
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  archiveAndPurgeLogs,
  getSystemStats,
} from "../controllers/adminController.js";

// All routes here are protected and Admin-only
router.use(protect, isAdmin);

router.get("/stats", getSystemStats);
router.post("/archive-logs", archiveAndPurgeLogs);

export default router;
