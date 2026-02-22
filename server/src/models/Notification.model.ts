import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender?: mongoose.Types.ObjectId;
    title: string;
    body: string;
    data?: Record<string, any>;
    type: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        data: {
            type: Schema.Types.Mixed,
            required: false,
        },
        type: {
            type: String,
            required: true,
            index: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

const Notification: Model<INotification> = mongoose.model<INotification>(
    "Notification",
    notificationSchema
);

export default Notification;
