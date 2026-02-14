import mongoose from "mongoose";
import Deal, { type DealStatus } from "../models/Deal.model.js";
import Bid from "../models/Bid.model.js";
import Inventory from "../models/Inventory.model.js";
import { Auction } from "../models/Auction.model.js";
import Escrow from "../models/Escrow.model.js";
import { refundEscrowService, releaseEscrowService } from "./escrow.service.js";

export const createDealService = async (bidId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    throw new Error("Invalid bid id");
  }

  // 1. Check if deal already exists for this bid
  const existingDeal = await Deal.findOne({ bidId });
  if (existingDeal) {
    throw new Error("Deal already exists for this bid");
  }

  // 2. Find bid
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw new Error("Bid not found");
  }

  // 3. Find auction, then inventory
  const auction = await Auction.findById(bid.auctionId);
  if (!auction) {
    throw new Error("Auction not found");
  }

  const inventory = await Inventory.findById(auction.inventoryId);
  if (!inventory) {
    throw new Error("Inventory not found");
  }

  // 4. Only the buyer who placed the bid can create the deal
  if (inventory.sellerId.toString() !== userId) {
    throw new Error("You are not authorized to create a deal for this bid");
  }

  // 5. Create deal (snapshot of current bid + inventory ownership)
  const deal = await Deal.create({
    bidId: bid._id,
    auctionId: auction._id,
    buyerId: bid.buyerId,
    sellerId: inventory.sellerId,
    agreedAmount: bid.bidAmount,
    status: "CREATED",
  });

  return deal;
};

export const createSystemDealService = async (bidId: string) => {
  if (!mongoose.Types.ObjectId.isValid(bidId)) {
    throw new Error("Invalid bid id");
  }

  // 1. Check if deal already exists for this bid
  const existingDeal = await Deal.findOne({ bidId });
  if (existingDeal) {
    // If deal already exists, return it (idempotency for cron)
    return existingDeal;
  }

  // 2. Find bid
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw new Error("Bid not found");
  }

  // 3. Find auction, then inventory
  const auction = await Auction.findById(bid.auctionId);
  if (!auction) {
    throw new Error("Auction not found");
  }

  const inventory = await Inventory.findById(auction.inventoryId);
  if (!inventory) {
    throw new Error("Inventory not found");
  }

  // 4. Create deal (snapshot of current bid + inventory ownership) by system
  const deal = await Deal.create({
    bidId: bid._id,
    auctionId: auction._id,
    buyerId: bid.buyerId,
    sellerId: inventory.sellerId,
    agreedAmount: bid.bidAmount,
    status: "CREATED",
  });

  return deal;
};

function getId(v: any): string {
  if (!v) return "";
  if (v._id) return String(v._id);
  return String(v);
}

const dealListPopulate = [
  { path: "buyerId", select: "username email" },
  { path: "sellerId", select: "username email" },
  { path: "auctionId" },
  { path: "bidId" },
];

export const getDealByIdService = async (
  dealId: string,
  userId: string,
  userRole: "admin" | "user"
) => {
  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    throw new Error("Invalid deal id");
  }

  const deal = await Deal.findById(dealId).populate(dealListPopulate).sort({ createdAt: -1 });

  if (!deal) {
    throw new Error("Deal not found");
  }

  const isAdmin = userRole === "admin";
  const isBuyer = getId(deal.buyerId) === userId;
  const isSeller = getId(deal.sellerId) === userId;

  if (!isAdmin && !isBuyer && !isSeller) {
    throw new Error("You are not authorized to view this deal");
  }

  return deal;
};

export const getallDealsService = async (
  userId: string,
  userRole: "admin" | "user"
) => {
  const isAdmin = userRole === "admin";
  const uid = new mongoose.Types.ObjectId(userId);

  if (isAdmin) {
    return await Deal.find({}).populate(dealListPopulate).sort({ createdAt: -1 });
  }

  const deals = await Deal.find({
    $or: [{ buyerId: uid }, { sellerId: uid }],
  })
    .populate(dealListPopulate)
    .sort({ createdAt: -1 });

  return deals;
};

const DEAL_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  CREATED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["IN_ESCROW", "CANCELLED"],
  IN_ESCROW: ["SHIPPED", "CANCELLED", "DISPUTED"],
  SHIPPED: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["COMPLETED", "DISPUTED"],
  DISPUTED: ["COMPLETED", "CANCELLED", "IN_ESCROW"],
  COMPLETED: [],
  CANCELLED: [],
};

export const updateDealStatusService = async (
  dealId: string,
  newStatus: DealStatus,
  userId: string,
  role: string
) => {
  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    throw new Error("Invalid deal id");
  }

  const deal = await Deal.findById(dealId);
  if (!deal) {
    throw new Error("Deal not found");
  }

  // Transition validation
  const allowed = DEAL_TRANSITIONS[deal.status as DealStatus];
  if (!allowed?.includes(newStatus)) {
    throw new Error(
      `Invalid transition from ${deal.status} to ${newStatus}`
    );
  }

  // Actor validation
  const isSeller = deal.sellerId.toString() === userId;
  const isBuyer = deal.buyerId.toString() === userId;
  const isAdmin = role === "admin";

  switch (newStatus) {
    case "SHIPPED":
      if (!isSeller && !isAdmin) {
        throw new Error("Only seller can mark as shipped");
      }
      break;
    case "DELIVERED":
      if (!isBuyer && !isAdmin) {
        throw new Error("Only buyer can confirm delivery");
      }
      break;
    case "CANCELLED":
      if (!isSeller && !isBuyer && !isAdmin) {
        throw new Error("Not allowed to cancel deal");
      }
      break;
    case "COMPLETED":
      if (!isAdmin) {
        throw new Error("Only admin/system can complete deal");
      }
      break;
    case "DISPUTED":
      if (!isSeller && !isBuyer && !isAdmin) {
        throw new Error("Only buyer, seller or admin can raise dispute");
      }
      break;
  }

  deal.status = newStatus;
  if (!deal.history) {
    deal.history = [];
  }
  deal.history.push({
    status: newStatus,
    changedBy: new mongoose.Types.ObjectId(userId),
    changedAt: new Date(),
  });
  await deal.save();

  return deal;
};

export const dealDownloadService = async (
  deal: any,
  cloudUrl: string
) => {
  const dealId = deal._id ?? deal.id;
  if (!dealId) {
    throw new Error("Deal id is required");
  }
  const updated = await Deal.findByIdAndUpdate(
    dealId,
    { $set: { pdfPath: cloudUrl } },
    { new: true }
  ).populate(dealListPopulate);
  return updated ?? deal;
}

export const cancelDealService = async (
  dealId: string,
  userId: string,
  role: string
) => {
  const session = await mongoose.startSession();
  if (process.env.NODE_ENV !== "development") {
    session.startTransaction();
  }

  try {
    const deal = await Deal.findById(dealId).session(session);
    if (!deal) throw new Error("Deal not found");

    const isBuyer = deal.buyerId.toString() === userId;
    const isSeller = deal.sellerId.toString() === userId;
    const isAdmin = role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error("Only buyer/seller/admin can cancel deal");
    }

    // if already completed, cannot cancel
    if (deal.status === "COMPLETED") {
      throw new Error("Completed deal cannot be cancelled");
    }

    // find escrow
    const escrow = await Escrow.findOne({ deal: dealId }).session(session);

    // if payment already held => refund must happen
    if (escrow && escrow.status === "HELD") {
      if (process.env.NODE_ENV !== "development") {
        await session.commitTransaction();
      }
      session.endSession();

      // refund service uses its own transaction
      return await refundEscrowService(dealId, userId);
    }

    // if payment was initiated but not held
    if (escrow && escrow.status === "PENDING") {
      escrow.status = "CANCELLED";
      await escrow.save({ session });
    }

    // cancel deal directly
    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      {
        $set: { status: "CANCELLED" },
        $push: {
          history: {
            status: "CANCELLED",
            changedBy: userId as any,
            changedAt: new Date(),
          },
        },
      },
      { new: true, session, runValidators: false }
    );

    if (!updatedDeal) {
      throw new Error("Failed to cancel deal: Update returned null");
    }

    if (process.env.NODE_ENV !== "development") {
      await session.commitTransaction();
    }
    session.endSession();

    return {
      deal: updatedDeal,
      escrow,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "development") {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
};

export const raiseDisputeService = async (
  dealId: string,
  reason: string,
  userId: string,
  role: string
) => {
  const session = await mongoose.startSession();
  if (process.env.NODE_ENV !== "development") {
    session.startTransaction();
  }

  try {
    const deal = await Deal.findById(dealId).session(session);
    if (!deal) throw new Error("Deal not found");

    const escrow = await Escrow.findOne({ deal: dealId }).session(session);
    if (!escrow) throw new Error("Escrow not found");

    const isBuyer = deal.buyerId.toString() === userId;
    const isSeller = deal.sellerId.toString() === userId;
    const isAdmin = role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error("Only buyer/seller/admin can raise dispute");
    }

    // dispute can happen only when money is in escrow
    if (escrow.status !== "HELD") {
      throw new Error("Dispute can only be raised when escrow is HELD");
    }

    if (deal.status === "DISPUTED") {
      throw new Error("Deal already disputed");
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      {
        $set: {
          status: "DISPUTED",
          dispute: {
            reason,
            raisedBy: userId as any,
            raisedAt: new Date(),
          },
        },
        $push: {
          history: {
            status: "DISPUTED",
            changedBy: userId as any,
            changedAt: new Date(),
          },
        },
      },
      { new: true, session, runValidators: false }
    );

    if (!updatedDeal) {
      throw new Error("Failed to dispute deal: Update returned null");
    }

    if (process.env.NODE_ENV !== "development") {
      await session.commitTransaction();
    }
    session.endSession();

    return updatedDeal;
  } catch (error) {
    if (process.env.NODE_ENV !== "development") {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
};

export const resolveDisputeService = async (
  dealId: string,
  resolution: "REFUND_BUYER" | "RELEASE_SELLER",
  adminNote: string,
  userId: string,
  role: string
) => {
  if (role !== "admin") {
    throw new Error("Only admin can resolve disputes");
  }

  if (!["REFUND_BUYER", "RELEASE_SELLER"].includes(resolution)) {
    throw new Error("Invalid resolution type");
  }

  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error("Deal not found");

  const escrow = await Escrow.findOne({ deal: dealId });
  if (!escrow) throw new Error("Escrow not found");

  if (deal.status !== "DISPUTED") {
    throw new Error("Deal is not in disputed state");
  }

  if (escrow.status !== "HELD") {
    throw new Error("Escrow must be HELD to resolve dispute");
  }

  // update dispute resolution fields
  const updatedDeal = await Deal.findByIdAndUpdate(
    dealId,
    {
      $set: {
        "dispute.resolvedBy": userId as any,
        "dispute.resolvedAt": new Date(),
        "dispute.resolution": resolution,
        "dispute.adminNote": adminNote,
      },
    },
    { new: true, runValidators: false }
  );

  if (!updatedDeal) {
    throw new Error("Failed to resolve dispute: Update returned null");
  }

  // now execute action based on resolution
  if (resolution === "REFUND_BUYER") {
    return await refundEscrowService(dealId, userId);
  }

  if (resolution === "RELEASE_SELLER") {
    return await releaseEscrowService(dealId, userId);
  }

  throw new Error("Invalid resolution type");
};
