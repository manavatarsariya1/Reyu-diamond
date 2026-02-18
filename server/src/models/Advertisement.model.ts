import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdvertisement extends Document {
    advertiserId: mongoose.Types.ObjectId;
    inventoryId?: mongoose.Types.ObjectId;

    title: string;
    description?: string;

    mediaUrl: string;
    mediaType: "image" | "video";

    ctaLink?: string;

    bannerSection: string[];

    status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
    rejectionReason?: string;

    startDate?: Date;
    endDate?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const AdvertisementSchema: Schema<IAdvertisement> = new Schema(
    {
        advertiserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        inventoryId: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
            required: false
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        mediaUrl: {
            type: String,
            required: true
        },
        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true
        },
        ctaLink: {
            type: String,
            trim: true
        },
        bannerSection: {
            type: [String],
            enum: ["HOME_DASHBOARD", "MARKETPLACE", "BANNER_ZONES"],
            default: ["BANNER_ZONES"]
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "DISABLED"],
            default: "PENDING",
            index: true
        },
        rejectionReason: {
            type: String
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export const Advertisement: Model<IAdvertisement> =
    mongoose.models.Advertisement ||
    mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);
