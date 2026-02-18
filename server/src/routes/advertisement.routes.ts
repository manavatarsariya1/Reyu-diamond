import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { Advertisement } from "../models/Advertisement.model.js";
import { loadUserRole, requireRole, ownerOrAdmin, owner } from "../middlewares/permission.middleware.js";
import * as advertisementController from "../controllers/advertisement.controller.js";
import Inventory from "../models/Inventory.model.js";

const router = Router();

router.get("/",
    authMiddleware,
    loadUserRole,
    advertisementController.getAdvertisements
);

router.get(
    "/:advertisementId",
    authMiddleware,
    loadUserRole,
    ownerOrAdmin(Advertisement, "advertiserId", "advertisementId"),
    advertisementController.getAdvertisementById
);

router.post(
    "/",
    authMiddleware,
    loadUserRole,
    upload.fields([
        { name: "media", maxCount: 1 },
    ]),
    owner(Inventory, "sellerId", "inventoryId"),
    advertisementController.createAdvertisement
);

// Admin routes
router.patch(
    "/:advertisementId/status",
    authMiddleware,
    loadUserRole,
    requireRole("admin"),
    advertisementController.updateAdvertisementStatus
);

router.get("/user/:userId",
    authMiddleware,
    loadUserRole,
    requireRole("admin"),
    advertisementController.getAdvertisements
);

export default router;
