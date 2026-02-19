import { Router } from "express";
import { createAuction, getAuctions, getAuction, updateAuction, deleteAuction } from "../controllers/auction.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";
import { createAuctionSchema, updateAuctionSchema } from "../validation/auction.validation.js";

import { ownerOrAdmin, loadUserRole } from "../middlewares/permission.middleware.js";
import Inventory from "../models/Inventory.model.js";
import { Auction } from "../models/Auction.model.js";

const router = Router();

router.use(protect, kycVerifiedOnly, loadUserRole);

router.post("/:inventoryId", validate(createAuctionSchema), ownerOrAdmin(Inventory, "sellerId", "inventoryId"), createAuction);
router.get("/", getAuctions);
router.get("/:auctionId", getAuction);
router.put("/:auctionId", validate(updateAuctionSchema), ownerOrAdmin(Auction, "inventoryId.sellerId", "auctionId"), updateAuction);
router.delete("/:auctionId", ownerOrAdmin(Auction, "inventoryId.sellerId", "auctionId"), deleteAuction);

export default router;

