import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createRequirement,
  getMyRequirements,
  getAllRequirements,
  updateRequirements,
  getRequirementById,
  deleteRequirement,
  getInquirySEO,
} from "../controllers/requirement.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { loadUserRole, ownerOrAdmin } from "../middlewares/permission.middleware.js";
import {
  createRequirementSchema,
  updateRequirementSchema,
} from "../validation/requirement.validation.js";
import { validate } from "../middlewares/validation.middleware.js";
import Requirement from "../models/requirement.model.js";
import isAdmin from "../middlewares/admin.middleware.js";


const router = Router();

// Public routes for sharing and SEO previews
router.get("/share/:id", getRequirementById); // Shared view API
router.get("/seo/:id", getInquirySEO);      // SEO Preview route (for bots)

router.use(protect, kycVerifiedOnly)
router.post("/", validate(createRequirementSchema), createRequirement);
router.put("/:id", loadUserRole, ownerOrAdmin(Requirement, "userId"), validate(updateRequirementSchema), updateRequirements);
router.get("/", isAdmin, getAllRequirements);
router.get("/my-requirement", getMyRequirements);
router.delete("/:id", loadUserRole, ownerOrAdmin(Requirement, "userId"), deleteRequirement);

export default router;
