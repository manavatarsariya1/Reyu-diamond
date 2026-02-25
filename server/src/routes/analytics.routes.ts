import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware, isAdmin);

// Get dashboard stats
router.get(
    "/dashboard",
    analyticsController.getDashboardStats
);

// Get revenue analytics
router.get(
    "/revenue",
    analyticsController.getRevenueAnalytics
);

export default router;
