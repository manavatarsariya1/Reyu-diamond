import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createBid,
  getAllBid,
  getSellerBid,
  updateBidStatus,
} from "../controllers/bid.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { loadUserRole } from "../middlewares/permission.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";
import { createBidSchema, updateBidStatusSchema } from "../validation/bid.validation.js";

const router = Router();

router.use(protect, kycVerifiedOnly, loadUserRole);

router.post("/:auctionId", validate(createBidSchema), createBid);
router.get("/:auctionId", getAllBid);
router.get("/:auctionId/my-bid", getSellerBid);
router.patch("/:bidId/status", validate(updateBidStatusSchema), updateBidStatus);

export default router;