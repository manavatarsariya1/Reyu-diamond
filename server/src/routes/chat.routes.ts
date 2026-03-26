import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createConversation,
  getUserConversations,
  markAsRead,
  getPotentialPartners,
} from "../controllers/chat.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";
import { createConversationSchema } from "../validation/chat.validation.js";

const router = Router();

router.use(protect, kycVerifiedOnly);

router.post("/conversations", validate(createConversationSchema), createConversation);
router.get("/conversations", getUserConversations);
router.get("/potential-partners", getPotentialPartners);
router.put("/conversations/:conversationId/read", markAsRead);


export default router;
