import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as chatService from "../services/chat.service.js";
import sendResponse from "../utils/api.response.js";

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { auctionId, inventoryId, participants } = req.body;
    const userId = req.user?.id;

    const set = new Set(participants as string[]);
    set.add(userId!.toString());

    const conversation = await chatService.createConversation(
      Array.from(set),
      (auctionId || inventoryId) as string,
      auctionId ? "Auction" : "Inventory"
    );

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Conversation created",
      data: conversation,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getUserConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    await chatService.markMessagesAsRead(conversationId as string, userId!.toString());

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Marked as read",
    });
  } catch (error: any) {
    next(error);
  }
};

export const getPotentialPartners = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const partners = await chatService.getPotentialPartners(userId!.toString());

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Success",
      data: partners,
    });
  } catch (error: any) {
    next(error);
  }
};
