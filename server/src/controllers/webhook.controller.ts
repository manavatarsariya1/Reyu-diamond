import type { Request, Response, NextFunction } from "express";
import stripe from "../utils/stripe.utility.js";
import { handleStripeWebhookService } from "../services/escrow.service.js";
import sendResponse from "../utils/api.response.js";

export const stripeWebhookHandler = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return sendResponse({ res, statusCode: 400, success: false, message: "Missing signature or webhook secret" });
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        await handleStripeWebhookService(event);

        return sendResponse({ res, statusCode: 200, success: true, message: "Received" });
    } catch (err: any) {
        next(err);
    }
};
