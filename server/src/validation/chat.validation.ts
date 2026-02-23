import { z } from "zod";
import mongoose from "mongoose";

export const createConversationSchema = z.object({
    auctionId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Auction ID").optional(),
    inventoryId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Inventory ID").optional(),
    participants: z
        .array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid User ID"))
        .min(1, "At least one participant is required"),
}).refine(data => data.auctionId || data.inventoryId, {
    message: "Either auctionId or inventoryId must be provided",
    path: ["auctionId"]
});
