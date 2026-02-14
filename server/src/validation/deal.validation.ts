import { z } from "zod";

const dealStatusEnum = [
    "CREATED",
    "PAYMENT_PENDING",
    "IN_ESCROW",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "DISPUTED",
    "CANCELLED",
] as const;

export const updateDealStatusSchema = z.object({
    status: z.enum(dealStatusEnum, {
        message: "Invalid status value",
    }),
});

export const raiseDisputeSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
});

export const resolveDisputeSchema = z.object({
    resolution: z.enum(["REFUND_BUYER", "RELEASE_SELLER"], {
        message: "Resolution must be REFUND_BUYER or RELEASE_SELLER",
    }),
    adminNote: z.string().optional(),
});
