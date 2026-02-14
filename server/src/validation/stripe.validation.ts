import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Deal ID");

export const initiatePaymentSchema = z.object({
    dealId: objectIdSchema,
});

export const releaseEscrowSchema = z.object({
    dealId: objectIdSchema,
});

export const refundEscrowSchema = z.object({
    dealId: objectIdSchema,
});

export const buyerConfirmDeliverySchema = z.object({
    dealId: objectIdSchema,
    notes: z.string().optional(),
});
