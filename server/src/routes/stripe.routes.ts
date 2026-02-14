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

import { validate } from "../middlewares/validation.middleware.js";
import {
    initiatePaymentSchema,
    releaseEscrowSchema,
    refundEscrowSchema,
    buyerConfirmDeliverySchema
} from "../validation/stripe.validation.js";

const router = Router();

router.use(protect, kycVerifiedOnly);

router.post("/webhook", stripeWebhookHandler);

router.post("/onboard", onboardUser);
router.post("/payment-intent", validate(initiatePaymentSchema), initiatePayment);
router.post("/release-payment", validate(releaseEscrowSchema), releaseEscrow);
router.post("/refund-escrow", validate(refundEscrowSchema), refundEscrow);
router.post("/buyer-confirm", validate(buyerConfirmDeliverySchema), buyerConfirmDelivery);

export default router;
