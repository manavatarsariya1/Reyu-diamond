import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as chatService from "../services/chat.service.js";
import sendResponse from "../utils/api.response.js";

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { auctionId, participants } = req.body;
    const userId = req.user?.id;

    const set = new Set(participants as string[]);
    set.add(userId!.toString());

    const conversation = await chatService.createConversation(
      Array.from(set),
      auctionId
    );

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Conversation created",
      data: conversation,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
      data: error.data || null,
    });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user?.id;

    const message = await chatService.sendMessage(
      conversationId,
      senderId!.toString(),
      content
    );

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Message sent",
      data: message,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const conversations = await chatService.getUserConversations(
      userId!.toString()
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Success",
      data: conversations,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const getConversationMessages = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    const messages = await chatService.getConversationMessages(
      conversationId as string,
      userId!.toString()
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Success",
      data: messages,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    await chatService.markMessagesAsRead(conversationId as string, userId!.toString());

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Marked as read",
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};
