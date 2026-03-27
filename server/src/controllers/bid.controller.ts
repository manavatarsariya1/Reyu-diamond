import type { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/api.response.js";
import {
  createBidService,
  getAllBidsByAuctionService,
  getMyBidByAuctionService,
  getMyBidByInventoryService,
  updateBidStatusService,
  getAllMyBidsService,
} from "../services/bid.service.js";
import { createSystemDealService } from "../services/deal.service.js";
import { notifyDealCreated, notifyAuctionOwnerNewBid, notifyBidderSuccess } from "../services/notification.service.js";

export const createBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = Array.isArray(req.params.auctionId)
      ? req.params.auctionId[0]
      : req.params.auctionId;
    const { bidAmount } = req.body;
    const role = (req as any).userRole as string | undefined;

    // from protect middleware
    const buyerId = (req as any).user?.id as string | undefined;

    if (!buyerId) {
      const err: any = new Error("BuyerId is required");
      err.statusCode = 400;
      throw err;
    }

    if (!auctionId) {
      const err: any = new Error("Valid auctionId is required");
      err.statusCode = 400;
      throw err;
    }

    if (!bidAmount || bidAmount <= 0) {
      const err: any = new Error("Valid bidAmount is required");
      err.statusCode = 400;
      throw err;
    }

    const bid = await createBidService({
      auctionId,
      buyerId,
      bidAmount,
      role
    });

    // Fire-and-forget: notify auction owner about new bid - notification
    notifyAuctionOwnerNewBid({
      auctionId,
      buyerName: (req as any).user?.username ?? "A buyer",
      bidAmount,
    }).catch((err) => console.error("New bid notification failed:", err));

    // notify bidder as well
    notifyBidderSuccess({
      buyerId,
      auctionId,
      bidAmount,
    }).catch((err) => console.error("Bidder success notification failed:", err));

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Bid placed successfully",
      data: bid ?? null,
    });
  } catch (error: any) {
    if (error.message === "Inventory not found") {
      error.statusCode = 404;
    } else if (error.message === "action owner is can not be do bid on the owner's invenory") {
      error.statusCode = 403;
    } else {
      error.statusCode = 400;
    }
    next(error);
  }
};

export const getAllBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = req.params.auctionId as string;
    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as string | undefined;

    if (!auctionId) {
      const err: any = new Error("Auction ID is required");
      err.statusCode = 400;
      throw err;
    }

    const bids = await getAllBidsByAuctionService(auctionId, userId as string, role);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Bids fetched successfully",
      data: bids,
    });
  } catch (error: any) {
    if (error.message === "Auction not found" || error.message === "Inventory not found") {
      error.statusCode = 404;
    } else if (error.message?.includes("not authorized")) {
      error.statusCode = 403;
    }
    next(error);
  }
};

export const getSellerBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = req.params.auctionId as string;
    const buyerId = (req as any).user?.id as string | undefined;

    if (!auctionId) {
      const err: any = new Error("Auction ID is required");
      err.statusCode = 400;
      throw err;
    }

    if (!buyerId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const bid = await getMyBidByAuctionService(auctionId, buyerId);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: bid ? "Your bid fetched successfully" : "No bid found for this auction",
      data: bid,
    });
  } catch (error: any) {
    if (error.message === "Auction not found") {
      error.statusCode = 404;
    }
    next(error);
  }
};

export const updateBidStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bidId = req.params.bidId as string;
    const { status } = req.body;
    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as "admin" | "user" | undefined;

    if (!bidId) {
      const err: any = new Error("Bid ID is required");
      err.statusCode = 400;
      throw err;
    }

    if (!status || !["ACCEPTED", "REJECTED", "EXPIRED"].includes(status)) {
      const err: any = new Error("Status is required and must be ACCEPTED, REJECTED, or EXPIRED");
      err.statusCode = 400;
      throw err;
    }

    const updatedBid = await updateBidStatusService(
      bidId,
      status as "ACCEPTED" | "REJECTED" | "EXPIRED",
      userId as string,
      role as "admin" | "user"
    );

    // Auto-create deal and notify parties when bid is accepted
    if (status === "ACCEPTED") {
      try {
        const deal = await createSystemDealService(bidId);
        // Fire-and-forget notifications (don't block the response) - notification
        notifyDealCreated(deal).catch((err) =>
          console.error("Deal notification failed:", err)
        );

        return sendResponse({
          res,
          statusCode: 200,
          success: true,
          message: `Bid ${status.toLowerCase()} successfully`,
          data: { bidId, status, deal },
        });
      } catch (dealError: any) {
        // Log but don't fail the bid status update response
        console.error("Auto deal creation failed after bid accept:", dealError?.message);
      }
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: `Bid ${status.toLowerCase()} successfully`,
      data: updatedBid,
    });
  } catch (error: any) {
    if (error.message === "Bid not found" || error.message === "Inventory not found") {
      error.statusCode = 404;
    } else if (error.message === "You are not authorized to update this bid") {
      error.statusCode = 403;
    } else if (error.message === "Bid is not in SUBMITTED status and cannot be updated" ||
      error.message === "Another bid has already been accepted for this inventory" ||
      error.message === "Only the highest bid can be accepted for this auction") {
      error.statusCode = 400;
    }
    next(error);
  }
}

export const getAllMyBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).user?.id as string | undefined;

    if (!buyerId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const bids = await getAllMyBidsService(buyerId);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Fetched all your bids successfully",
      data: bids,
    });
  } catch (error: any) {
    next(error);
  }
};