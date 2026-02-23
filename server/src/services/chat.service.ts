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
