import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import * as chatService from "../services/message.service.js";
import sendResponse from "../utils/api.response.js";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user?.id;
    const files = req.files as Express.Multer.File[];

    const message = await chatService.sendMessage(
      conversationId,
      senderId!.toString(),
      content,
      files
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

export const getConversationMessages = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const messages = await chatService.getConversationMessages(
      conversationId as string,
      userId.toString()
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

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    await chatService.deleteMessage(messageId as string, userId!.toString());

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Message deleted successfully",
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