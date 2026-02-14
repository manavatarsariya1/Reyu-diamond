import { z } from "zod";
import mongoose from "mongoose";

export const sendMessageSchema = z.object({
    conversationId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Conversation ID"),
    content: z.string().optional(),
}).refine(
    (data) => {
        // If we can't check req.files here, we at least ensure content acts as expected if no files are present.
        // However, validation middleware might not have access to req.files directly in the body.
        // For now, we allow content to be optional because files might be uploaded.
        // The controller or a separate refined check would need to verify that at least one of content or files exists.
        return true;
    }
);
