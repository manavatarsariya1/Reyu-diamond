import { z } from "zod";
import mongoose from "mongoose";

export const createConversationSchema = z.object({
    auctionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Auction ID"),
    participants: z
        .array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid User ID"))
        .min(1, "At least one participant is required"),
});
