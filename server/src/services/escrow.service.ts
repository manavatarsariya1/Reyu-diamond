import Stripe from "stripe";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import Deal from "../models/Deal.model.js";
import Escrow from "../models/Escrow.model.js";

import stripeHelper from "../utils/stripe.utility.js"; // Renamed to avoid name clash if any, but default export is the instance
import { stripeService } from "./stripe.service.js";
import type { Request } from "express"; // Added type import for req usage

// Use the imported stripe instance
const stripe = stripeHelper;

/**
 * 1. Seller Onboarding
 * Generates an onboarding link for the seller to connect their Stripe account.
 */
export const onboardSellerService = async (
    userId: string,
    req?: Request
) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let accountId = user.stripeAccountId;

    // ✅ Create if missing
    if (!accountId) {
        accountId = await stripeService.createStripeAccount(user);
        user.stripeAccountId = accountId;
        await user.save();
    }

    let accountLink: string;

    try {
        accountLink = await stripeService.createOnboardingLink(accountId, req);
    } catch (error: any) {
        /**
         * 🔥 If stripe account deleted / invalid
         * recreate automatically
         */
        if (error.message === "ACCOUNT_INVALID") {
            console.warn(`Stripe account ${accountId} invalid. Recreating...`);

            user.stripeAccountId = undefined;
            await user.save();

            accountId = await stripeService.createStripeAccount(user);
            user.stripeAccountId = accountId;
            await user.save();

            accountLink = await stripeService.createOnboardingLink(accountId, req);
        } else {
            throw error;
        }
    }

    return { url: accountLink };
};

/**
 * 2. Create Payment Intent (Escrow)
 * Buyer pays, funds go to Platform account.
 */
export const createEscrowPaymentService = async (
    dealId: string,
    userId: string
) => {
    const deal = await Deal.findById(dealId).populate("sellerId");
    if (!deal) throw new Error("Deal not found");

    if (deal.buyerId.toString() !== userId) {
        throw new Error("Only buyer can make payment");
    }

    // Ensure seller has connected their account
    const seller = await User.findById(deal.sellerId);
    if (!seller?.stripeAccountId) {
        throw new Error("Seller has not connected their Stripe account yet");
    }

    // Check if Escrow record already exists
    let escrow = await Escrow.findOne({ deal: dealId });

    if (escrow && escrow.status !== "HELD") {
        // If it exists and is released/refunded, we probably shouldn't pay again?
        // Or if payment failed previously?
        // For simplicity assuming new payment needed if not HELD or if Stripe PI missing.
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(deal.agreedAmount * 100), // Amount in cents
        currency: deal.currency.toLowerCase(),
        payment_method_types: ["card"],
        metadata: {
            dealId: deal._id.toString(),
            buyerId: userId,
            type: "ESCROW_PAYMENT",
        },
    });

    // Create/Update Escrow Record
    if (!escrow) {
        escrow = await Escrow.create({
            deal: deal._id,
            buyer: userId,
            seller: deal.sellerId,
            amount: deal.agreedAmount,
            currency: deal.currency,
            status: "HELD",
            paymentIntentId: paymentIntent.id,
        });
    } else {
        escrow.paymentIntentId = paymentIntent.id;
        escrow.status = "HELD"; // Reset status if retrying
        await escrow.save();
    }

    // Deal status usually updated via webhook (payment_intent.succeeded)
    return {
        clientSecret: paymentIntent.client_secret,
        escrowId: escrow._id,
    };
};

/**
 * 3. Release Payment
 * Admins or System triggers release of funds to Seller.
 */
export const releaseEscrowService = async (
    dealId: string,
    userId: string
) => {
    const deal = await Deal.findById(dealId);
    if (!deal) throw new Error("Deal not found");

    const escrow = await Escrow.findOne({ deal: dealId });
    if (!escrow) throw new Error("Escrow record not found");

    if (escrow.status === "RELEASED") {
        throw new Error("Funds already released");
    }

    if (deal.status !== "DELIVERED" && deal.status !== "COMPLETED") {
        throw new Error("Deal must be delivered before releasing funds");
    }

    if (!escrow.paymentIntentId) {
        throw new Error("No payment record found");
    }

    const seller = await User.findById(deal.sellerId).select("stripeAccountId");
    if (!seller?.stripeAccountId) {
        throw new Error("Seller Stripe account not found");
    }

    // Verify PaymentIntent and get Charge ID
    const paymentIntent = await stripe.paymentIntents.retrieve(escrow.paymentIntentId);
    const chargeId = paymentIntent.latest_charge as string;

    if (!chargeId) {
        throw new Error("No charge found for this payment intent");
    }

    // Create Transfer
    const transfer = await stripe.transfers.create({
        amount: Math.round(escrow.amount * 100),
        currency: escrow.currency.toLowerCase(),
        destination: seller.stripeAccountId,
        metadata: {
            dealId: dealId,
            escrowId: escrow._id.toString(),
        },
        source_transaction: chargeId,
    });

    escrow.stripeTransferId = transfer.id;
    escrow.status = "RELEASED";
    await escrow.save();

    // Update Deal Status
    await Deal.findByIdAndUpdate(
        dealId,
        {
            $set: {
                "payment.isPaid": true,
                "payment.paidAt": new Date(),
                status: "COMPLETED",
            },
            $push: {
                history: {
                    status: "COMPLETED",
                    changedBy: new mongoose.Types.ObjectId(userId),
                    changedAt: new Date(),
                },
            },
        },
        { runValidators: false }
    );

    return transfer;
};

/**
 * 4. Refund Payment
 * Move funds back to Buyer.
 */
export const refundEscrowService = async (
    dealId: string,
    userId: string
) => {
    const escrow = await Escrow.findOne({ deal: dealId });
    if (!escrow) throw new Error("Escrow record not found");

    if (!escrow.paymentIntentId) {
        throw new Error("No payment to refund");
    }

    if (escrow.status === "REFUNDED") {
        throw new Error("Already refunded");
    }

    if (escrow.status === "RELEASED") {
        throw new Error("Cannot refund, funds already released to seller");
    }

    const refund = await stripe.refunds.create({
        payment_intent: escrow.paymentIntentId,
        metadata: {
            dealId: dealId,
            escrowId: escrow._id.toString(),
            reason: "Escrow Refund",
        },
    });

    escrow.stripeRefundId = refund.id;
    escrow.status = "REFUNDED";
    await escrow.save();

    // Update Deal
    await Deal.findByIdAndUpdate(
        dealId,
        {
            $set: { status: "CANCELLED" },
            $push: {
                history: {
                    status: "CANCELLED",
                    changedBy: new mongoose.Types.ObjectId(userId),
                    changedAt: new Date(),
                },
            },
        },
        { runValidators: false }
    );

    return refund;
};

/**
 * 5. Handle Stripe Webhooks
 * Update Deal/Escrow status based on events.
 */
export const handleStripeWebhookService = async (event: Stripe.Event) => {
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const { dealId, buyerId } = paymentIntent.metadata;

            if (!dealId) break;

            const deal = await Deal.findById(dealId);
            if (!deal) break;

            const escrow = await Escrow.findOne({ deal: dealId });
            if (escrow) {
                escrow.status = "HELD";
                escrow.paymentIntentId = paymentIntent.id;
                await escrow.save();
            }

            await Deal.findByIdAndUpdate(
                dealId,
                {
                    $set: {
                        status: "IN_ESCROW",
                        "payment.isPaid": true,
                        "payment.paidAt": new Date(),
                        "payment.transactionId": paymentIntent.id,
                        "payment.method": "stripe",
                    },
                    $push: {
                        history: {
                            status: "IN_ESCROW",
                            changedBy: new mongoose.Types.ObjectId(buyerId),
                            changedAt: new Date(),
                        },
                    },
                },
                { runValidators: false }
            );
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const { dealId } = paymentIntent.metadata;
            if (!dealId) break;

            console.error(`Payment failed for Deal: ${dealId}`);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }
};
