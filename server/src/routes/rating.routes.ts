import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createRatingSchema } from "../validation/rating.validation.js";
import { createRating, getUserRatings } from "../controllers/rating.controller.js";

const router = express.Router();

router.use(protect, kycVerifiedOnly);

router.post("/", validate(createRatingSchema), createRating);
router.get("/user/:userId", getUserRatings);

export default router;
