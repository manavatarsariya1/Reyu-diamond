import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createRatingSchema } from "../validation/rating.validation.js";
import { createRating, getUserRatings, getUserReputation, getRatingByUserAndDeal } from "../controllers/rating.controller.js";

const router = express.Router();

router.use(protect, kycVerifiedOnly);

router.post("/", validate(createRatingSchema), createRating);
router.get("/user/:userId", getUserRatings);
router.get("/reputation/:userId", getUserReputation);
router.get("/check/:dealId", getRatingByUserAndDeal);

export default router;
