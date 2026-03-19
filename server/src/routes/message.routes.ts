import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getConversationMessages,
  deleteMessage,
} from "../controllers/message.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";
import { sendMessageSchema } from "../validation/message.validation.js";

const router = Router();

router.use(protect, kycVerifiedOnly);

router.post("/", upload.any(), validate(sendMessageSchema), sendMessage);
router.delete("/:messageId", deleteMessage);
router.get("/:conversationId", getConversationMessages);

export default router;
