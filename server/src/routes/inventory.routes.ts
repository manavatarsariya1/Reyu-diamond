import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createInventory,
  getAllInventories,
  updateInventory,
  deleteInventory,
  getInventoryById,
  getInventorySEO,
} from "../controllers/inventory.controller.js";
import { kycVerifiedOnly } from "../middlewares/kyc.middleware.js";
import { loadUserRole, ownerOrAdmin } from "../middlewares/permission.middleware.js";
import Inventory from "../models/Inventory.model.js";
import { validate } from "../middlewares/validation.middleware.js";
import { createInventorySchema, updateInventorySchema } from "../validation/inventory.validation.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  protect,
  kycVerifiedOnly,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  validate(createInventorySchema),
  createInventory
);
router.get("/", getAllInventories);
router.get("/seo/:id", getInventorySEO);
router.get("/:id", getInventoryById);
router.put(
  "/:id",
  protect,
  kycVerifiedOnly,
  loadUserRole,
  validate(updateInventorySchema),
  updateInventory
);
router.delete(
  "/:id",
  protect,
  kycVerifiedOnly,
  loadUserRole,
  ownerOrAdmin(Inventory, "sellerId", "id"),
  deleteInventory
);

export default router;