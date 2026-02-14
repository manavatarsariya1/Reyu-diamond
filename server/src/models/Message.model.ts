import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content?: string;
    attachments?: {
        url: string;
        publicId: string;
        resourceType: string;
    }[];
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },
        attachments: [
            {
                url: String,
                publicId: String,
                resourceType: String,
            },
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>(
    "Message",
    messageSchema
);

export default Message;
