import { z } from "zod";

export const createBidSchema = z.object({
    bidAmount: z.coerce.number().min(1, "Bid amount must be positive"),
});

export const updateBidStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "EXPIRED"], {
        message: "Status must be ACCEPTED, REJECTED, or EXPIRED",
    }),
});
