import { Router } from "express";
import authRoutes from "./auth.routes.js";
import kycRoutes from "./kyc.routes.js";
import adminRoutes from "./admin.routes.js";
import requirementRoutes from "./requirement.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import bidRoutes from "./bid.routes.js";
import dealRoutes from "./deal.routes.js";
import auctionRoutes from "./auction.routes.js";
import stripeRoutes from "./stripe.routes.js";
import chatRoutes from "./chat.routes.js";
import ratingRoutes from "./rating.routes.js";
import advertisementRoutes from "./advertisement.routes.js";
import logRoutes from "./log.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/kyc", kycRoutes);
router.use("/admin", adminRoutes);
router.use("/requirements", requirementRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/auction", auctionRoutes);
router.use("/bid", bidRoutes);
router.use("/deal", dealRoutes);
router.use("/stripe", stripeRoutes);
router.use("/ratings", ratingRoutes);
router.use("/chat", chatRoutes);
router.use("/advertisements", advertisementRoutes);
router.use("/logs", logRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationRoutes);

export default router;
