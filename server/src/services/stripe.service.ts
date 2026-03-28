import stripe, { getStripeAccountParams, getAccountLinkParams } from "../utils/stripe.utility.js";
import mongoose from "mongoose";
import type { IUser } from "../models/User.model.js";
import User from "../models/User.model.js";
import Deal from "../models/Deal.model.js";
import Escrow from "../models/Escrow.model.js";
import { Auction } from "../models/Auction.model.js";
import Inventory from "../models/Inventory.model.js";
import type { Request } from "express";

/**
 * Service to handle Stripe related operations
 */
export class StripeService {
    /**
     * Create a generic connected account for a user
     */
    async createStripeAccount(user: IUser): Promise<string> {
        try {
            console.log("in 0");

            if (user.stripeAccountId) {
                console.log("in 1");
                return user.stripeAccountId;
            }
            console.log("in 2");

            const params = getStripeAccountParams(user.email, user._id.toString());
            console.log("in 3 params: ", params);
            const account = await stripe.accounts.create(params);
            console.log("in 4: ", account);

            user.stripeAccountId = account.id;
            await user.save();

            return account.id;
        } catch (error: any) {
            console.error("Error creating Stripe account:", error);
            throw new Error(`Failed to create Stripe account: ${error.message}`);
        }
    }

    /**
     * Validate if account has necessary capabilities
     */
    async validateAccountCapability(accountId: string): Promise<boolean> {
        const account = await stripe.accounts.retrieve(accountId);

        // Check if transfers capability is active
        const transfers = account.capabilities?.transfers;
        const cardPayments = account.capabilities?.card_payments;

        if (transfers !== 'active' && account.type !== 'standard') {
            // Standard accounts might manage this differently, but for express/custom it's key.
            // For standard in test mode, it should still be active if onboarded.
            console.warn(`Stripe Account ${accountId} capability 'transfers' is ${transfers}`);
        }

        if (!account.payouts_enabled) {
            console.warn(`Stripe Account ${accountId} payouts_enabled is false`);
            // return false; // Strict check?
        }

        // For the specific error "insufficient_capabilities_for_transfer", checking capabilities matches
        if (transfers === 'inactive') {
            return false;
        }

        return true;
    }

    /**
     * Create an account link for onboarding
     */
    async createOnboardingLink(accountId: string, req?: Request): Promise<string> {
        try {
            // Determine base URL from request or fallback to a default (e.g., localhost)
            // Ideally this should be in config, but for now we'll infer or use a placeholder
            // In production, this must be the actual frontend URL
            const origin = req?.get("origin") || "http://localhost:5173";

            const params = getAccountLinkParams(accountId, origin);
            const accountLink = await stripe.accountLinks.create(params);

            return accountLink.url;
        } catch (error: any) {
            console.error("Error creating onboarding link:", error);
            // Check if error is due to account not found
            if (error.raw?.code === 'account_invalid' ||
                error?.message?.includes('does not exist') ||
                error?.raw?.message?.includes('does not exist')) {
                throw new Error("ACCOUNT_INVALID");
            }
            throw new Error(`Failed to create onboarding link: ${error.message}`);
        }
    }

    /**
     * Create a Payment Intent for a Deal
     */
    async createPaymentIntent(
        deal: any
    ): Promise<{ clientSecret: string; paymentIntentId: string; status?: string }> {
        try {
            // Prevent duplicate escrow
            const existingEscrow = await Escrow.findOne({ deal: deal._id });

            if (existingEscrow) {
                if (
                    existingEscrow.status !== "FAILED" &&
                    existingEscrow.status !== "CANCELLED"
                ) {
                    try {
                        const retrievedIntent = await stripe.paymentIntents.retrieve(
                            existingEscrow.paymentIntentId
                        );

                        if (retrievedIntent.status === "succeeded") {
                            // Idempotency safety: if Stripe says it's paid but our DB doesn't, sync it now
                            if (existingEscrow.status === "PENDING") {
                                existingEscrow.status = "HELD";
                                await existingEscrow.save();

                                await Deal.findByIdAndUpdate(deal._id, {
                                    $set: { 
                                        status: "IN_ESCROW",
                                        payment: {
                                            isPaid: true,
                                            paidAt: new Date(),
                                            method: retrievedIntent.payment_method_types?.[0] || 'card',
                                            transactionId: retrievedIntent.id
                                        }
                                    }
                                });
                            }

                            return {
                                clientSecret: retrievedIntent.client_secret!,
                                paymentIntentId: existingEscrow.paymentIntentId,
                                status: "succeeded"
                            };
                        }

                        if (retrievedIntent.client_secret) {
                            return {
                                clientSecret: retrievedIntent.client_secret,
                                paymentIntentId: existingEscrow.paymentIntentId,
                            };
                        }
                    } catch (retrieveError: any) {
                        // If intent is missing on Stripe but we have it in DB, we'll create a new one
                        if (retrieveError.code === 'resource_missing') {
                            console.warn(`Payment intent ${existingEscrow.paymentIntentId} missing on Stripe. Creating a new one.`);
                        } else {
                            throw retrieveError;
                        }
                    }
                }
            }

            // Convert to cents
            const amountInCents = Math.round(deal.agreedAmount * 100);

            const metadata = {
                dealId: deal._id.toString(),
                buyerId: deal.buyerId.toString(),
                sellerId: deal.sellerId.toString(),
                type: "ESCROW_PAYMENT",
            };

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: deal.currency.toLowerCase(),
                metadata,
                capture_method: "automatic",
                payment_method_types: ["card"],
            });

            if (!paymentIntent.client_secret) {
                throw new Error("Failed to generate client secret");
            }

            // Create or update escrow atomically
            await Escrow.findOneAndUpdate(
                { deal: deal._id },
                {
                    $set: {
                        buyer: deal.buyerId,
                        seller: deal.sellerId,
                        amount: deal.agreedAmount,
                        currency: deal.currency.toLowerCase(),
                        status: "PENDING",
                        paymentIntentId: paymentIntent.id,
                        platformFeePercentage: 3,
                    }
                },
                { upsert: true, new: true, runValidators: true }
            );

            // Update Deal status to PAYMENT_PENDING with history
            await Deal.findByIdAndUpdate(deal._id, {
                $set: { status: "PAYMENT_PENDING" },
                $push: {
                    history: {
                        status: "PAYMENT_PENDING",
                        changedBy: deal.buyerId,
                        changedAt: new Date(),
                    }
                }
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        } catch (error: any) {
            console.error("Error creating payment intent:", error);
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    async releaseEscrow(dealId: string) {
        const isProduction = process.env.NODE_ENV === "production";

        // find escrow
        const escrow = await Escrow.findOne({ deal: dealId });

        if (!escrow) {
            throw new Error("Escrow not found");
        }

        if (escrow.status !== "HELD") {
            throw new Error("Escrow is not in releasable state (payment Status: " + escrow.status + ")");
        }

        if (!escrow.buyerConfirmedAt) {
            throw new Error("Buyer has not confirmed delivery yet.");
        }

        // find seller
        const seller = await User.findById(escrow.seller).select("stripeAccountId");
        console.log("Seller:", seller);
        if (!seller || !seller.stripeAccountId) {
            throw new Error("Seller not onboarded with Stripe. First do Onboarding process.");
        }

        // Validate capabilities
        const capabilitiesValid = await this.validateAccountCapability(seller.stripeAccountId);
        if (!capabilitiesValid) {
            throw new Error("Seller Stripe account missing necessary capabilities (transfers). Please visit Stripe Dashboard or re-onboard.");
        }

        // Retrieve PaymentIntent to get Charge ID for source_transaction
        const paymentIntent = await stripe.paymentIntents.retrieve(escrow.paymentIntentId);
        const chargeId = paymentIntent.latest_charge as string;

        if (!chargeId) {
            throw new Error("No charge found for this payment intent. Cannot release funds.");
        }

        // Retrieve platform account to check if seller is the same (e.g. in test/dev)
        const platformAccount = await stripe.accounts.retrieve();

        const totalAmount = Math.round(escrow.amount * 100);
        const platformFee = Math.round(
            (totalAmount * (escrow.platformFeePercentage || 3)) / 100
        );

        const sellerAmount = totalAmount - platformFee;

        let transfer;
        if (seller.stripeAccountId !== platformAccount.id) {
            // transfer to seller
            transfer = await stripe.transfers.create({
                amount: sellerAmount,
                currency: escrow.currency,
                destination: seller.stripeAccountId,
                source_transaction: chargeId,
                metadata: {
                    dealId: dealId.toString(),
                    escrowId: escrow._id.toString(),
                },
            });
        } else {
            console.log(`[Stripe] Skipping transfer for Deal ${dealId} as destination is the platform account itself.`);
            transfer = { id: 'manual_platform_internal' };
        }

        if (isProduction) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                // update escrow
                escrow.status = "RELEASED";
                escrow.stripeTransferId = transfer.id;
                await escrow.save({ session });

                // update deal
                const startDeal = await Deal.findByIdAndUpdate(dealId, {
                    $set: { status: "COMPLETED" },
                    $push: {
                        history: {
                            status: "COMPLETED",
                            changedAt: new Date(),
                        }
                    }
                }, { session });

                if (startDeal) {
                    const auction = await Auction.findById(startDeal.auctionId).session(session);
                    if (auction) {
                        await Inventory.findByIdAndUpdate(auction.inventoryId, {
                            status: "SOLD",
                        }, { session });
                    }
                }

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            // update escrow
            escrow.status = "RELEASED";
            escrow.stripeTransferId = transfer.id;
            await escrow.save();

            // update deal
            const startDeal = await Deal.findByIdAndUpdate(dealId, {
                $set: { status: "COMPLETED" },
                $push: {
                    history: {
                        status: "COMPLETED",
                        changedAt: new Date(),
                    }
                }
            });

            if (startDeal) {
                const auction = await Auction.findById(startDeal.auctionId);
                if (auction) {
                    await Inventory.findByIdAndUpdate(auction.inventoryId, {
                        status: "SOLD",
                    });
                }
            }
        }

        return {
            transferId: transfer.id,
            sellerAmount: sellerAmount / 100,
            platformFee: platformFee / 100,
        };
    }

    async refundEscrow(dealId: string) {
        const escrow = await Escrow.findOne({ deal: dealId });

        if (!escrow) {
            throw new Error("Escrow not found");
        }

        if (escrow.status === "RELEASED") {
            throw new Error("Cannot refund after release");
        }

        if (escrow.status === "REFUNDED") {
            throw new Error("Already refunded");
        }

        // Stripe refund
        const refund = await stripe.refunds.create({
            payment_intent: escrow.paymentIntentId,
        });

        // update escrow
        escrow.status = "REFUNDED";
        escrow.stripeRefundId = refund.id;
        await escrow.save();

        // update deal
        await Deal.findByIdAndUpdate(dealId, {
            $set: { status: "CANCELLED" },
            $push: {
                history: {
                    status: "CANCELLED",
                    changedAt: new Date(),
                }
            }
        });

        return {
            refundId: refund.id,
            amount: refund.amount / 100,
        };
    }

    async buyerConfirmDelivery(
        dealId: string,
        userId: string,
        notes?: string
    ) {
        const escrow = await Escrow.findOne({ deal: dealId });

        if (!escrow) {
            throw new Error("Escrow not found");
        }

        // must be buyer
        if (escrow.buyer.toString() !== userId.toString()) {
            throw new Error("Only buyer can confirm delivery");
        }

        if (escrow.status !== "HELD") {
            throw new Error("Escrow not ready for confirmation (payment Status: " + escrow.status + ")");
        }

        // save confirmation
        escrow.buyerConfirmedAt = new Date();
        escrow.buyerConfirmationNotes = notes;

        escrow.timeline.push({
            event: "BUYER_CONFIRMED",
            timestamp: new Date(),
            userId: escrow.buyer,
            notes,
        });

        await escrow.save();

        return await this.releaseEscrow(dealId);
    }
}

export const stripeService = new StripeService();
