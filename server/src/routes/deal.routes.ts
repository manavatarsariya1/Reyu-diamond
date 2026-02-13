import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { dealCreation, dealDetailsById, getAllBids, updateDealStatus, downloadPDF, cancelDeal, raiseDispute, resolveDispute } from "../controllers/deal.controller.js";
import { loadUserRole } from "../middlewares/permission.middleware.js";
import { canAccessDeal } from "../middlewares/canAccessDeal.middleware.js";

const router = Router();
router.use(protect, kycVerifiedOnly);

router.post("/:bidId", dealCreation);
router.get("/:dealId", loadUserRole, dealDetailsById);
router.get("/", loadUserRole, getAllBids);
router.patch("/:dealId", loadUserRole, canAccessDeal, updateDealStatus);
router.post("/:dealId/pdf", loadUserRole, canAccessDeal, downloadPDF);

// cancel, dispute raise, resolve dispute
router.patch("/:dealId/cancel", cancelDeal);
router.patch("/:dealId/dispute", raiseDispute);
router.patch("/:dealId/resolve-dispute", resolveDispute);

export default router;
