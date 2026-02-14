import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";
import { uploadToCloudinaryDetails, deleteFromCloudinary } from "../services/cloudinary.service.js";

export const createConversation = async (
  participants: string[],
  auctionId: string
) => {
  if (participants.length !== 2) {
    const err: any = new Error("Need seller & bidder");
    err.statusCode = 400;
    throw err;
  }

  const exists = await Chat.findOne({
    auctionId,
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
    auctionId,
    unreadCounts: {},
  });
};

export const getUserConversations = async (userId: string) => {
  return Chat.find({ participants: userId })
    .populate("participants", "username email")
    .populate("auctionId", "title")
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
