import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";
import { reviewKyc } from "../controllers/admin-kyc.controller.js";
import { updateUserStatus } from "../controllers/admin-user.controller.js";

const router = Router();

router.patch("/kyc/:userId", authMiddleware, isAdmin, reviewKyc);
router.patch("/users/:userId/status", authMiddleware, isAdmin, updateUserStatus);

export default router;

