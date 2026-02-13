import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

/**
 * Retry a function with exponential backoff
 * Retries on 5xx errors, network errors, and rate limit errors
 */
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries - 1;

            // Check if error is retryable
            const isRetryable =
                error.statusCode >= 500 ||
                error.type === "StripeConnectionError" ||
                error.type === "StripeAPIError" ||
                error.code === "rate_limit";

            if (!isRetryable || isLastAttempt) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(
                `Stripe operation failed (attempt ${attempt + 1
                }/${maxRetries}). Retrying in ${delay}ms...`,
                error.message
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("Max retries exceeded");
};

export const createPaymentIntent = async (
    amount: number,
    currency: string,
    metadata: any
) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
};

export const createAndConfirmPayment = async (
    amount: number,
    currency: string,
    paymentMethodId: string,
    metadata: any
) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        confirm: true,
        capture_method: "automatic",
        metadata,
        payment_method_types: ["card"],
    });
    return paymentIntent;
};

export const createPaymentIntentForEscrow = async (
    amount: number,
    currency: string,
    metadata: any,
    idempotencyKey?: string
) => {
    return retryWithBackoff(async () => {
        const options: any = {
            amount,
            currency,
            metadata,
            capture_method: "automatic",
            automatic_payment_methods: { enabled: true },
        };

        const requestOptions = idempotencyKey ? { idempotencyKey } : undefined;

        console.log("[Stripe] Creating PaymentIntent with options:", JSON.stringify(options));
        console.log("[Stripe] Request Options:", requestOptions);

        // Pass requestOptions only if it exists, otherwise the SDK might complain about empty object
        const paymentIntent = await stripe.paymentIntents.create(
            options,
            requestOptions
        );
        return paymentIntent;
    });
};

export const capturePayment = async (paymentIntentId: string) => {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent;
};

export const refundPayment = async (
    paymentIntentId: string,
    amount?: number,
    idempotencyKey?: string
) => {
    return retryWithBackoff(async () => {
        const refundOptions: any = {
            payment_intent: paymentIntentId,
        };

        if (amount) {
            refundOptions.amount = amount;
        }

        const requestOptions: any = {};
        if (idempotencyKey) {
            requestOptions.idempotencyKey = idempotencyKey;
        }

        const refund = await stripe.refunds.create(refundOptions, requestOptions);
        return refund;
    });
};

export const cancelPayment = async (paymentIntentId: string) => {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
};

export const createTransfer = async (
    amount: number,
    currency: string,
    destination: string,
    metadata: any,
    idempotencyKey?: string
) => {
    return retryWithBackoff(async () => {
        const transferOptions: any = {
            amount,
            currency,
            destination,
            metadata,
        };

        const requestOptions: any = {};
        if (idempotencyKey) {
            requestOptions.idempotencyKey = idempotencyKey;
        }

        const transfer = await stripe.transfers.create(
            transferOptions,
            requestOptions
        );
        return transfer;
    });
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (
    payload: string | Buffer,
    signature: string,
    secret: string
) => {
    try {
        const event = stripe.webhooks.constructEvent(payload, signature, secret);
        return event;
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        throw new Error("Invalid webhook signature");
    }
};

export const getStripeAccountParams = (email: string, userId: string): Stripe.AccountCreateParams => {
    return {
        type: 'standard', // or 'express'
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        metadata: { userId }
    };
};

export const getAccountLinkParams = (accountId: string, origin: string): Stripe.AccountLinkCreateParams => {
    return {
        account: accountId,
        refresh_url: `${origin}/stripe/onboard/refresh`, // You might need to adjust these routes
        return_url: `${origin}/stripe/onboard/return`,
        type: 'account_onboarding'
    };
};

export default stripe;
