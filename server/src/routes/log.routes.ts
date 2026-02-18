import { Router } from "express";
import { logController } from "../controllers/log.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = Router();

// Get Admin Logs
router.get("/admin", authMiddleware, isAdmin, logController.getAdminLogs);

// Get System Logs
router.get("/system", authMiddleware, isAdmin, logController.getSystemLogs);

// Get System Stats
router.get("/system/stats", authMiddleware, isAdmin, logController.getSystemStats);

export default router;
