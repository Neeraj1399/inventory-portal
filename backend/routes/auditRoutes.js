import express from "express";
import { getAllAuditLogs } from "../controllers/auditController.js";

const router = express.Router();

// GET /api/audit-logs
router.get("/", getAllAuditLogs);

export default router;
