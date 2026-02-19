import { Router } from "express";
import { logController } from "../controllers/log.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware, isAdmin);

// Get Admin Logs
router.get("/admin", logController.getAdminLogs);

// Get System Logs
router.get("/system", logController.getSystemLogs);

// Get System Stats
router.get("/system/stats", logController.getSystemStats);

export default router;
