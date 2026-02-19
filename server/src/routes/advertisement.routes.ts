import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { Advertisement } from "../models/Advertisement.model.js";
import { loadUserRole, ownerOrAdmin, owner } from "../middlewares/permission.middleware.js";
import * as advertisementController from "../controllers/advertisement.controller.js";
import Inventory from "../models/Inventory.model.js";
import isAdmin from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware, loadUserRole);

router.get("/",
    advertisementController.getAdvertisements
);

router.get(
    "/:advertisementId",
    ownerOrAdmin(Advertisement, "advertiserId", "advertisementId"),
    advertisementController.getAdvertisementById
);

router.post(
    "/",
    upload.fields([
        { name: "media", maxCount: 1 },
    ]),
    owner(Inventory, "sellerId", "inventoryId"),
    advertisementController.createAdvertisement
);

// Admin routes
router.patch(
    "/:advertisementId/status",
    isAdmin,
    advertisementController.updateAdvertisementStatus
);

router.get("/user/:userId",
    isAdmin,
    advertisementController.getAdvertisements
);

export default router;
