import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    contextId: mongoose.Types.ObjectId;
    contextType: "Auction" | "Inventory";
    lastMessage?: mongoose.Types.ObjectId;
    unreadCounts: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new mongoose.Schema<IChat>(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Assuming 'User' model exists
                required: true,
            },
        ],
        contextId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "contextType",
        },
        contextType: {
            type: String,
            required: true,
            enum: ["Auction", "Inventory"],
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        unreadCounts: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ contextId: 1, contextType: 1 });

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
