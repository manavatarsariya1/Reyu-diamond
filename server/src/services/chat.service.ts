import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";

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

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  const chat = await Chat.findById(conversationId);

  if (!chat) {
    const err: any = new Error("Conversation not found");
    err.statusCode = 404;
    throw err;
  }

  if (!chat.participants.some(p => p.toString() === senderId)) {
    const err: any = new Error("You are Not participant of this conversation");
    err.statusCode = 403;
    throw err;
  }

  const message = await Message.create({
    conversationId,
    sender: senderId,
    content,
    readBy: [senderId],
  });

  chat.lastMessage = message._id as mongoose.Types.ObjectId;

  chat.participants.forEach(p => {
    const id = p.toString();
    if (id !== senderId) {
      const count = chat.unreadCounts.get(id) || 0;
      chat.unreadCounts.set(id, count + 1);
    }
  });

  await chat.save();

  const populated = await message.populate("sender", "username email");

  // 🔥 REALTIME EMIT
  const io = getIO();
  io.to(conversationId).emit("new_message", populated);

  return populated;
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

export const getConversationMessages = async (
  conversationId: string,
  userId: string
) => {
  return Message.find({ conversationId })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  await Message.updateMany(
    { conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  const chat = await Chat.findById(conversationId);
  if (chat) {
    chat.unreadCounts.set(userId, 0);
    await chat.save();
  }
};
