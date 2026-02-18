import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRating extends Document {
    dealId: mongoose.Types.ObjectId;
    raterId: mongoose.Types.ObjectId;
    targetId: mongoose.Types.ObjectId; // receiver person

    score: number;
    feedback?: string;

    createdAt: Date;
    updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
    {
        dealId: {
            type: Schema.Types.ObjectId,
            ref: "Deal",
            required: true,
            index: true,
        },
        raterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
            maxlength: 500,
            trim: true,
        },
    },
    { timestamps: true }
);

// Compound index to ensure one rating per user per deal
ratingSchema.index({ dealId: 1, raterId: 1 }, { unique: true });

const Rating: Model<IRating> = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
