import express from "express";
import { getAllAuditLogs } from "../controllers/auditController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/audit-logs — admin only
router.get("/", protect, isAdmin, getAllAuditLogs);

export default router;
