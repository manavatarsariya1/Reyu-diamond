import mongoose, { Document, Model, Schema } from "mongoose";

export type EscrowStatus = "HELD" | "RELEASED" | "REFUNDED" | "PENDING" | "FAILED" | "CANCELLED";

export interface IEscrow extends Document {
    deal: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;

    amount: number;
    currency: string;
    status: EscrowStatus;

    paymentIntentId: string;
    stripeTransferId?: string;
    stripeRefundId?: string;
    platformFeePercentage: number;

    buyerConfirmedAt?: Date;
    buyerConfirmationNotes?: string | undefined;

    timeline: {
        event: string;
        timestamp: Date;
        userId?: mongoose.Types.ObjectId;
        notes?: string | undefined;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

const escrowSchema = new Schema<IEscrow>(
    {
        deal: {
            type: Schema.Types.ObjectId,
            ref: "Deal",
            required: true,
            unique: true,
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "usd",
        },
        status: {
            type: String,
            enum: ["HELD", "RELEASED", "REFUNDED", "PENDING", "FAILED", "CANCELLED"],
            default: "PENDING",
        },
        paymentIntentId: {
            type: String,
            required: true,
        },
        stripeTransferId: {
            type: String,
        },
        stripeRefundId: {
            type: String,
        },
        platformFeePercentage: {
            type: Number,
            default: 3,
        },
        buyerConfirmedAt: {
            type: Date,
        },
        buyerConfirmationNotes: {
            type: String,
        },
        timeline: [
            {
                event: String,
                timestamp: { type: Date, default: Date.now },
                userId: { type: Schema.Types.ObjectId, ref: "User" },
                notes: String,
            },
        ],
    },
    { timestamps: true }
);

const Escrow: Model<IEscrow> = mongoose.model<IEscrow>("Escrow", escrowSchema);
export default Escrow;

