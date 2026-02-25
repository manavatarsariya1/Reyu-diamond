import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getKycStatus, submitKyc } from "../controllers/kyc.controller.js";

const router = Router();

// using any() to debug unexpected field error
const kycUploadMiddleware = upload.any();

import { validate } from "../middlewares/validation.middleware.js";
import { submitKycSchema } from "../validation/kyc.validation.js";

router.post("/submit", authMiddleware, kycUploadMiddleware, validate(submitKycSchema), submitKyc);
router.get("/:userId", authMiddleware,getKycStatus );

export default router;

