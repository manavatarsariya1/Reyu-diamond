import Chat from "../models/Chat.model.js";
import Message from "../models/Message.model.js";
import mongoose from "mongoose";
import { getIO } from "../socket.js";
import { uploadToCloudinaryDetails, deleteFromCloudinary } from "../services/cloudinary.service.js";

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  files?: Express.Multer.File[]
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

  let attachments: { url: string; publicId: string; resourceType: string }[] = [];

  if (files && files.length > 0) {
    const uploadPromises = files.map(async (file) => {
      let resourceType: "image" | "video" | "raw" | "auto" = "image";
      if (file.mimetype.startsWith("image/")) resourceType = "image";
      else if (file.mimetype.startsWith("video/")) resourceType = "video";
      else resourceType = "auto";

      const { secure_url, public_id } = await uploadToCloudinaryDetails(
        file,
        "chat_attachments",
        resourceType
      );

      return {
        url: secure_url,
        publicId: public_id,
        resourceType,
      };
    });

    attachments = await Promise.all(uploadPromises);
  }

  if (!content && attachments.length === 0) {
    const err: any = new Error("Message must have content or attachment");
    err.statusCode = 400;
    throw err;
  }

  const message = await Message.create({
    conversationId,
    sender: senderId,
    content: content || "",
    attachments,
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

  // REALTIME EMIT
  const io = getIO();
  io.to(conversationId).emit("new_message", populated);

  return populated;
};

export const getConversationMessages = async (
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

  return Message.find({ conversationId })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });
};

export const deleteMessage = async (messageId: string, userId: string) => {
  const message = await Message.findById(messageId);

  if (!message) {
    const err: any = new Error("Message not found");
    err.statusCode = 404;
    throw err;
  }

  if (message.sender.toString() !== userId) {
    const err: any = new Error("You are not authorized to delete this message");
    err.statusCode = 403;
    throw err;
  }

  // decrease count start 

  const chat = await Chat.findById(message.conversationId);

  if (chat) {
    // Decrease unread count for participants who haven't read this message
    chat.participants.forEach((p) => {
      const pId = p.toString();
      // If user is NOT the sender AND has NOT read the message
      if (
        pId !== userId &&
        !message.readBy.some((readerId) => readerId.toString() === pId)
      ) {
        const currentCount = chat.unreadCounts.get(pId) || 0;
        if (currentCount > 0) {
          chat.unreadCounts.set(pId, currentCount - 1);
        }
      }
    });
  }
  // end
  if (message.attachments && message.attachments.length > 0) {
    const deletePromises = message.attachments.map((attachment) =>
      deleteFromCloudinary(
        attachment.publicId,
        attachment.resourceType as "image" | "video" | "raw" | "auto"
      )
    );
    await Promise.all(deletePromises);
  }

  await message.deleteOne();

  if (chat) {
    // Update lastMessage if the deleted message was the last one
    if (chat.lastMessage?.toString() === messageId) {
      const lastMsg = await Message.findOne({
        conversationId: message.conversationId,
      }).sort({ createdAt: -1 });

      // @ts-ignore
      chat.lastMessage = lastMsg
        ? (lastMsg._id as mongoose.Types.ObjectId)
        : undefined;
    }
    await chat.save();
  }

  return { message: "Message deleted successfully" };
};