import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";
import { uploadToCloudinaryDetails, deleteFromCloudinary } from "../services/cloudinary.service.js";
import Inventory from "../models/Inventory.model.js";
import { Auction } from "../models/Auction.model.js";

export const createConversation = async (
  participants: string[],
  contextId: string,
  contextType: "Auction" | "Inventory"
) => {
  if (participants.length !== 2) {
    const err: any = new Error("Need authenticated seller or buyer");
    err.statusCode = 400;
    throw err;
  }

  const inventory = await Inventory.findById(contextId);

  if (contextType === "Inventory" && !inventory) {
    const err: any = new Error("Inventory is not existing");
    err.statusCode = 400;
    throw err;
  }

  const auction = await Auction.findById(contextId).populate("inventoryId");
  if (contextType === "Auction" && !auction) {
    const err: any = new Error("Auction is not existing");
    err.statusCode = 400;
    throw err;
  }

  // Extract the sellerId from either the inventory or the populated auction inventory
  const sellerId = (inventory?.sellerId || (auction?.inventoryId as any)?.sellerId)?.toString();

  if (!sellerId) {
    const err: any = new Error("Seller information not found");
    err.statusCode = 404;
    throw err;
  }

  // Check if the seller is one of the participants. 
  // At least one participant must be the owner of the item.
  if (!participants.includes(sellerId)) {
    const err: any = new Error("You are not authorized to create conversation");
    err.statusCode = 403;
    throw err;
  }

  const exists = await Chat.findOne({
    contextId,
    contextType,
    participants: { $all: participants },
  });

  if (exists) {
    const err: any = new Error("Conversation already exists");
    err.statusCode = 409;
    err.data = exists;
    throw err;
  }

  return await Chat.create({
    participants,
    contextId,
    contextType,
    unreadCounts: {},
  });
};

export const getUserConversations = async (userId: string) => {
  return Chat.find({ participants: userId })
    .populate("participants", "username email")
    .populate("contextId")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "username" },
    })
    .sort({ updatedAt: -1 });
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  const chat = await Chat.findById(conversationId);

  if (!chat) {
    const err: any = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  if (!chat.participants.some((p) => p.toString() === userId)) {
    const err: any = new Error("You are not a participant of this conversation");
    err.statusCode = 403;
    throw err;
  }

  await Message.updateMany(
    { conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  chat.unreadCounts.set(userId, 0);
  await chat.save();
};

export const getPotentialPartners = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);

  // 1. Find Deals where user is participant
  const deals = await mongoose.model("Deal").find({
    $or: [{ buyerId: uid }, { sellerId: uid }]
  }).populate("buyerId sellerId auctionId").populate({
    path: "auctionId",
    populate: { path: "inventoryId" }
  });

  // 2. Find Bids placed by user (to find sellers)
  const myBids = await mongoose.model("Bid").find({ buyerId: uid })
    .populate({
      path: "auctionId",
      populate: { path: "inventoryId" }
    });

  // 3. Find Bids on my auctions (to find buyers)
  const auctionsIOwn = await Auction.find({ recipient: uid }); // recipient is the owner in Auction model it seems
  // Wait, let's check Auction model recipient field
  const auctionIds = auctionsIOwn.map(a => a._id);
  const bidsOnMyAuctions = await mongoose.model("Bid").find({ auctionId: { $in: auctionIds } })
    .populate("buyerId").populate({
        path: "auctionId",
        populate: { path: "inventoryId" }
    });

  const partnersMap = new Map();

  // Process Deals
  deals.forEach((d: any) => {
    const partner = d.buyerId._id.toString() === userId ? d.sellerId : d.buyerId;
    const key = `${partner._id}_${d.auctionId?._id || d._id}`;
    partnersMap.set(key, {
      userId: partner._id,
      username: partner.username,
      contextId: d.auctionId?._id || d.auctionId || d._id,
      contextType: "Auction", 
      itemTitle: d.auctionId?.inventoryId?.stoneId || d.auctionId?.inventoryId?.certificateNumber || "Deal Interaction"
    });
  });

  // Process My Bids
  myBids.forEach((b: any) => {
    const sellerId = b.auctionId?.inventoryId?.sellerId;
    if (sellerId) {
        const key = `${sellerId}_${b.auctionId._id}`;
        if (!partnersMap.has(key)) {
            partnersMap.set(key, {
                userId: sellerId,
                username: "Seller", // We might need to populate this properly
                contextId: b.auctionId._id,
                contextType: "Auction",
                itemTitle: b.auctionId.inventoryId.stoneId || "Auction Interaction"
            });
        }
    }
  });

  // Process Bids on My Auctions
  bidsOnMyAuctions.forEach((b: any) => {
    const partner = b.buyerId;
    const key = `${partner._id}_${b.auctionId._id}`;
    if (!partnersMap.has(key)) {
        partnersMap.set(key, {
            userId: partner._id,
            username: partner.username,
            contextId: b.auctionId._id,
            contextType: "Auction",
            itemTitle: b.auctionId.inventoryId.stoneId || "Bid Interaction"
        });
    }
  });

  return Array.from(partnersMap.values());
};
