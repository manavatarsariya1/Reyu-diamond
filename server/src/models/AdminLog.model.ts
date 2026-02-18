import mongoose, { Schema, Document, Model } from "mongoose";

export type AdminAction =
    | "USER_APPROVED"
    | "USER_REACTIVATED"
    | "USER_DEACTIVED"
    | "KYC_APPROVED"
    | "KYC_REJECTED"
    | "LISTING_REMOVED"
    | "LISTING_APPROVED"
    | "BID_CANCELLED"
    | "DEAL_CANCELLED"
    | "DISPUTE_RESOLVED"
    | "ESCROW_RELEASED"
    | "ESCROW_REFUNDED"
    | "AD_APPROVED"
    | "AD_REJECTED"
    | "AD_DISABLED"
    | "MARKETPLACE_SECTION_DISABLED"
    | "MARKETPLACE_SECTION_ENABLED";

export type AdminTargetType =
    | "USER"
    | "KYC"
    | "INVENTORY"
    | "AUCTION"
    | "BID"
    | "DEAL"
    | "ESCROW"
    | "ADVERTISEMENT"
    | "MARKETPLACE";

export interface IAdminLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: AdminAction;
    targetType: AdminTargetType;
    targetId: mongoose.Types.ObjectId;
    description?: string;
    createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: [
                "USER_APPROVED", // done
                "USER_REACTIVATED", // done
                "USER_DEACTIVED", // done
                "KYC_APPROVED", // done
                "KYC_REJECTED", // done
                "LISTING_REMOVED",
                "LISTING_APPROVED",
                "BID_CANCELLED",
                "DEAL_CANCELLED",
                "DISPUTE_RESOLVED",
                "ESCROW_RELEASED",
                "ESCROW_REFUNDED", // done
                "AD_APPROVED", // done
                "AD_REJECTED", // done
                "AD_DISABLED", // done
                "MARKETPLACE_SECTION_DISABLED",
                "MARKETPLACE_SECTION_ENABLED"
            ],
            required: true,
            index: true
        },
        targetType: {
            type: String,
            enum: [
                "USER",
                "KYC",
                "INVENTORY",
                "AUCTION",
                "BID",
                "DEAL",
                "ESCROW",
                "ADVERTISEMENT",
                "MARKETPLACE"
            ],
            required: true,
            index: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        description: String
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdminLog: Model<IAdminLog> =
    mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
