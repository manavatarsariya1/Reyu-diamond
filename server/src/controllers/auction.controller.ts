import type { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/api.response.js";
import { createAuctionService, getAuctionsService, getAuctionByIdService, updateAuctionService, deleteAuctionService } from "../services/auction.service.js";
import { notifyAllUsersNewAuction } from "../services/notification.service.js";

interface AuthenticatedRequest extends Request {
  user?: any;
  userRole?: string;
}

export const createAuction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { inventoryId } = req.params as { inventoryId: string };
    const { basePrice, startDate, endDate } = req.body;

    if (!inventoryId || typeof inventoryId !== "string") {
      next(Object.assign(new Error("Invalid Inventory ID"), { statusCode: 400 }));
    }

    if (!basePrice || !startDate || !endDate) {
      next(Object.assign(new Error("Missing required fields"), { statusCode: 400 }));
    }

    const auction = await createAuctionService({
      inventoryId,
      basePrice,
      startDate,
      endDate,
      recipientId: req.user.id
    });

    // Fire-and-forget: notify all users about the new auction - notification
    notifyAllUsersNewAuction((auction._id as any).toString())
      .catch((err) => console.error("Auction notification failed:", err));

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Auction created successfully",
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuctions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const auctions = await getAuctionsService(query);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Auctions retrieved successfully",
      data: auctions,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auctionId } = req.params as { auctionId: string };

    if (!auctionId || typeof auctionId !== "string") {
      next(Object.assign(new Error("Invalid Auction ID"), { statusCode: 400 }));
    }

    const auction = await getAuctionByIdService(auctionId);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Auction retrieved successfully",
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { auctionId } = req.params as { auctionId: string };
    const updates = req.body;

    if (!auctionId || typeof auctionId !== "string") {
      next(Object.assign(new Error("Invalid Auction ID"), { statusCode: 400 }));
    }

    const auction = await updateAuctionService(
      auctionId,
      updates,
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Auction updated successfully",
      data: auction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { auctionId } = req.params as { auctionId: string };

    if (!auctionId || typeof auctionId !== "string") {
      next(Object.assign(new Error("Invalid Auction ID"), { statusCode: 400 }));
    }

    await deleteAuctionService(auctionId, req.user.id, req.userRole || "");

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Auction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
