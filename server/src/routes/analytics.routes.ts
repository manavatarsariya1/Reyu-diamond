import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = Router();

// Get dashboard stats
router.get(
    "/dashboard",
    authMiddleware,
    isAdmin,
    analyticsController.getDashboardStats
);

// Get revenue analytics
router.get(
    "/revenue",
    authMiddleware,
    isAdmin,
    analyticsController.getRevenueAnalytics
);

export default router;
