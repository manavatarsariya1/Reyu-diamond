import { z } from "zod";

export const createRatingSchema = z.object({
    dealId: z.string().min(1, "Deal ID is required"),
    score: z.number().int().min(1).max(5),
    feedback: z.string().max(500).optional(),
});
