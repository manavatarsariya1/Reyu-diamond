import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    auctionId: mongoose.Types.ObjectId;
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
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction", // Assuming 'Auction' model exists
            required: true,
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
chatSchema.index({ auctionId: 1 });

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
