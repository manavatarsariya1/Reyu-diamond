import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
  markAsRead,
} from "../controllers/chat.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";

const router = Router();

/**
 * 🔒 Protect all chat routes
 */
router.use(protect, kycVerifiedOnly);

/**
 * Conversation Routes
 */
router.post("/conversations", createConversation);
router.get("/conversations", getUserConversations);
router.put("/conversations/:conversationId/read", markAsRead);

/**
 * Message Routes
 */
router.post("/messages", sendMessage);
router.get("/messages/:conversationId", getConversationMessages);

export default router;
