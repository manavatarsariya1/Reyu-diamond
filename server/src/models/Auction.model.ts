import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuction extends Document {
  recipient: mongoose.Types.ObjectId;
  inventoryId: mongoose.Types.ObjectId;
  
  basePrice: number;
  highestBidPrice: number;

  highestBidderId?: mongoose.Types.ObjectId;

  bidIds: mongoose.Types.ObjectId[];
  highestBidId?: mongoose.Types.ObjectId;

  status: "ACTIVE" | "CLOSED" | "CANCELLED";

  startDate: Date;
  endDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema: Schema<IAuction> = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    highestBidPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    highestBidderId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    bidIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bid"
      }
    ],

    highestBidId: {
      type: Schema.Types.ObjectId,
      ref: "Bid"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "CANCELLED"],
      default: "ACTIVE",
      index: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Auction: Model<IAuction> =
  mongoose.models.Auction ||
  mongoose.model<IAuction>("Auction", AuctionSchema);
