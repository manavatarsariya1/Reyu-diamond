import { Router } from "express";
import {
    onboardUser,
    initiatePayment,
    releaseEscrow,
    refundEscrow,
    buyerConfirmDelivery,
    stripeWebhookHandler
} from "../controllers/stripe.controller.js";
import protect from "../middlewares/auth.middleware.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";

const router = Router();

router.use(protect, kycVerifiedOnly);

router.post("/webhook", stripeWebhookHandler);

router.post("/onboard", onboardUser);
router.post("/payment-intent", initiatePayment);
router.post("/release-payment", releaseEscrow);
router.post("/refund-escrow", refundEscrow);
router.post("/buyer-confirm", buyerConfirmDelivery);

export default router;
