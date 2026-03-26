import type { Request, Response, NextFunction } from "express";
import { stripeService } from "../services/stripe.service.js";
import { logService } from "../services/log.service.js";
import User from "../models/User.model.js";
import Deal from "../models/Deal.model.js";
import Escrow from "../models/Escrow.model.js";
import sendResponse from "../utils/api.response.js";
import stripe from "../utils/stripe.utility.js";
import {
    notifyPaymentInitiated,
    notifyEscrowReleased,
    notifyEscrowRefunded,
} from "../services/notification.service.js";

export const onboardUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findById(userId);

        if (!user) {
            const err: any = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        let accountId = user.stripeAccountId;
        console.log("ACCOUNT ID:", accountId);

        if (!accountId) {
            console.log("Creating new Stripe account");
            accountId = await stripeService.createStripeAccount(user);
            user.stripeAccountId = accountId;
            await user.save();
        }

        let accountLink;
        try {
            accountLink = await stripeService.createOnboardingLink(accountId!, req);
        } catch (error: any) {
            if (error.message === 'ACCOUNT_INVALID') {
                console.warn(`Stripe account ${accountId} invalid, creating new one`);
                user.stripeAccountId = undefined;
                await user.save(); // Clear invalid ID

                accountId = await stripeService.createStripeAccount(user); // Create new

                // createStripeAccount updates user object but let's be safe
                user.stripeAccountId = accountId;
                await user.save();

                accountLink = await stripeService.createOnboardingLink(accountId, req);
            } else {
                throw error;
            }
        }

        return sendResponse({ res, statusCode: 200, success: true, message: "Onboarding link generated", data: { url: accountLink } });
    } catch (error: any) {
        next(error);
    }
};

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealId } = req.body;
        const userId = (req as any).user._id || (req as any).user.id;

        if (!dealId) {
            const err: any = new Error("Deal ID is required");
            err.statusCode = 400;
            throw err;
        }

        const deal = await Deal.findById(dealId);
        if (!deal) {
            const err: any = new Error("Deal not found");
            err.statusCode = 404;
            throw err;
        }

        // Verify the user is the buyer
        if (deal.buyerId.toString() !== userId.toString()) {
            const err: any = new Error("Only the buyer can initiate payment for this deal");
            err.statusCode = 403;
            throw err;
        }

        const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(deal);

        await logService.createSystemLog({
            eventType: "PAYMENT_INTENT_INITIATED",
            targetId: deal._id as any,
            severity: "INFO",
            message: `Payment intent created for Deal ${deal._id}`,
            meta: { paymentIntentId }
        });

        // Fire-and-forget: notify seller + admins 
        notifyPaymentInitiated(dealId).catch((e) => console.error("notifyPaymentInitiated:", e));

        return sendResponse({ res, statusCode: 200, success: true, message: "Payment initiated", data: { clientSecret, paymentIntentId } });

    } catch (error: any) {
        next(error);
    }
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    console.log("🔔 Stripe Webhook received. Signature:", sig ? "Present" : "Missing");
    console.log("Raw body length:", req.body ? req.body.length : 0);

    let event;

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET is not defined");
        return res.sendStatus(500);
    }

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err: any) {
        console.log("❌ Webhook signature verification failed:", err.message);
        await logService.createSystemLog({
            eventType: "WEBHOOK_ERROR",
            targetId: null as any,
            severity: "ERROR",
            message: `Webhook signature verification failed: ${err.message}`,
            meta: { error: err.message, ip: req.ip }
        });
        return res.sendStatus(400);
    }

    console.log("📩 Stripe Event Verified:", event.type);
    console.log("Event Data Object ID:", event.data.object.id);

    try {
        /**
         * PAYMENT SUCCESS (Money Authorized / Captured depending on your flow)
         */
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent: any = event.data.object;

            let escrow = await Escrow.findOne({
                paymentIntentId: paymentIntent.id,
            });

            if (!escrow && paymentIntent.metadata?.dealId) {
                console.log("🔍 Escrow not found by paymentIntentId. Trying metadata.dealId:", paymentIntent.metadata.dealId);
                escrow = await Escrow.findOne({ deal: paymentIntent.metadata.dealId });
            }

            if (!escrow) {
                console.log("⚠️ Escrow not found for paymentIntent.id:", paymentIntent.id);
                // If we STILL can't find it, we can't update anything
                return res.json({ received: true });
            }
            console.log("✅ Found Escrow document:", escrow._id, "Status:", escrow.status);

            // Update escrow
            escrow.status = "HELD";
            escrow.paymentIntentId = paymentIntent.id;
            await escrow.save();

            // Update deal
            const updatedDeal = await Deal.findByIdAndUpdate(escrow.deal, {
                status: "IN_ESCROW",
                payment: {
                    isPaid: true,
                    paidAt: new Date(),
                    method: paymentIntent.payment_method_types?.[0] || 'card',
                    transactionId: paymentIntent.id
                }
            });
            console.log("✅ Updated Deal status to IN_ESCROW:", updatedDeal?._id);

            await logService.createSystemLog({
                eventType: "PAYMENT_HELD",
                targetId: escrow.deal as any,
                severity: "INFO",
                message: `Payment succeeded and Escrow funded for Deal ${escrow.deal}`,
                meta: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount }
            });

            console.log("✅ Escrow funded, deal moved to IN_ESCROW");
        }

        /**
         * PAYMENT FAILED
         */
        if (event.type === "payment_intent.payment_failed") {
            const paymentIntent: any = event.data.object;

            const escrow = await Escrow.findOne({
                paymentIntentId: paymentIntent.id,
            });

            if (escrow) {
                escrow.status = "FAILED";
                await escrow.save();

                await logService.createSystemLog({
                    eventType: "PAYMENT_FAILED",
                    targetId: escrow.deal as any,
                    severity: "ERROR",
                    message: `Payment failed for Deal ${escrow.deal}`,
                    meta: { paymentIntentId: paymentIntent.id, error: paymentIntent.last_payment_error }
                });
            }

            console.log("❌ Payment failed:", paymentIntent.id);
        }

        /**
         * PAYMENT CANCELED
         */
        if (event.type === "payment_intent.canceled") {
            const paymentIntent: any = event.data.object;

            const escrow = await Escrow.findOne({
                paymentIntentId: paymentIntent.id,
            });

            if (escrow) {
                escrow.status = "CANCELLED";
                await escrow.save();

                await logService.createSystemLog({
                    eventType: "PAYMENT_FAILED", // or PAYMENT_FAILED
                    targetId: escrow._id as any,
                    severity: "WARNING",
                    message: `Payment canceled for Escrow ${escrow._id}`,
                    meta: { paymentIntentId: paymentIntent.id }
                });
            }

            console.log("⚠️ Payment cancelled:", paymentIntent.id);
        }

        return res.json({ received: true });

    } catch (err: any) {
        console.log("Webhook handler error:", err);
        await logService.createSystemLog({
            eventType: "WEBHOOK_ERROR",
            targetId: null as any,
            severity: "ERROR",
            message: `Stripe Webhook Handler Exception: ${err.message}`,
            meta: { error: err.message, stack: err.stack }
        });
        return res.sendStatus(500);
    }
};

export const releaseEscrow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealId } = req.body;
        const userId = (req as any).user._id || (req as any).user.id;

        if (!dealId) {
            const err: any = new Error("Deal ID is required");
            err.statusCode = 400;
            throw err;
        }

        const deal = await Deal.findById(dealId);
        if (!deal) {
            const err: any = new Error("Deal not found");
            err.statusCode = 404;
            throw err;
        }

        // Only buyer can release
        if (deal.buyerId.toString() !== userId.toString()) {
            const err: any = new Error("Only buyer can release payment");
            err.statusCode = 403;
            throw err;
        }

        const result = await stripeService.releaseEscrow(dealId);

        await logService.createSystemLog({
            eventType: "PAYMENT_RELEASED",
            targetId: dealId as any,
            severity: "INFO",
            message: `Payment released for Deal ${dealId}`,
            meta: { dealId }
        });

        return sendResponse({ res, statusCode: 200, success: true, message: "Escrow released successfully", data: result });
    } catch (error: any) {
        next(error);
    }
};

export const refundEscrow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealId } = req.body;
        const userId = (req as any).user._id || (req as any).user.id;
        const userRole = (req as any).user.role;

        if (!dealId) {
            const err: any = new Error("Deal ID is required");
            err.statusCode = 400;
            throw err;
        }

        const deal = await Deal.findById(dealId);
        if (!deal) {
            const err: any = new Error("Deal not found");
            err.statusCode = 404;
            throw err;
        }

        // seller or admin can refund
        if (deal.sellerId.toString() !== userId.toString() && userRole !== 'admin') {
            const err: any = new Error("Not allowed to refund this deal.");
            err.statusCode = 403;
            throw err;
        }

        const result = await stripeService.refundEscrow(dealId);

        if (userRole === 'admin') {
            await logService.createAdminLog({
                adminId: userId,
                action: "ESCROW_REFUNDED",
                targetType: "DEAL",
                targetId: dealId,
                description: "Escrow refunded by admin"
            });
        }

        // Fire-and-forget: notify seller + buyer + admins
        notifyEscrowRefunded(dealId).catch((e) => console.error("notifyEscrowRefunded:", e));

        return sendResponse({ res, statusCode: 200, success: true, message: "Escrow refunded successfully", data: result });
    } catch (error: any) {
        next(error);
    }
};

export const buyerConfirmDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealId, notes } = req.body;
        const userId = (req as any).user._id || (req as any).user.id;

        if (!dealId) {
            const err: any = new Error("Deal ID is required");
            err.statusCode = 400;
            throw err;
        }

        const result = await stripeService.buyerConfirmDelivery(
            dealId,
            userId,
            notes
        );

        // Fire-and-forget: notify seller + admins
        notifyEscrowReleased(dealId).catch((e) => console.error("notifyEscrowReleased:", e));

        return sendResponse({ res, statusCode: 200, success: true, message: "Buyer confirmed & escrow released", data: result });
    } catch (error: any) {
        next(error);
    }
};
