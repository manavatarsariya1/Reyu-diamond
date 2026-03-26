import type { Request, Response, NextFunction } from "express";
import sendResponse from "../utils/api.response.js";
import {
  createDealService,
  getDealByIdService,
  getallDealsService,
  updateDealStatusService,
  dealDownloadService,
  cancelDealService,
  raiseDisputeService,
  resolveDisputeService
} from "../services/deal.service.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { htmlToPdfBuffer } from "../services/pdf.service.js";
import { getDealInvoiceHtml } from "../templates/deal-invoice.template.js";
import User from "../models/User.model.js";
import {
  notifyDisputeRaised,
  notifyDisputeResolved,
  notifyDealCancelled,
  notifyDealCreated,
} from "../services/notification.service.js";

export const dealCreation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bidId = req.params.bidId as string;
    const userId = (req as any).user?.id as string | undefined;

    if (!bidId) {
      const err: any = new Error("Bid ID is required");
      err.statusCode = 400;
      throw err;
    }

    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const deal = await createDealService(bidId, userId);

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Deal created successfully",
      data: deal,
    });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === "Invalid bid id") error.statusCode = 400;
    else if (msg === "Deal already exists for this bid") error.statusCode = 409;
    else if (msg === "Bid not found" || msg === "Inventory not found") error.statusCode = 404;
    else if (msg === "You are not authorized to create a deal for this bid") error.statusCode = 403;
    next(error);
  }
};

export const dealDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealId = req.params.dealId as string;
    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as "admin" | "user" | undefined;

    if (!dealId) {
      const err: any = new Error("Deal ID is required");
      err.statusCode = 400;
      return next(err);
    }

    if (!userId || !role) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const deal = await getDealByIdService(
      dealId,
      userId as string,
      role as "admin" | "user"
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Deal fetched successfully",
      data: deal,
    });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === "Invalid deal id") error.statusCode = 400;
    else if (msg === "Deal not found") error.statusCode = 404;
    else if (msg === "You are not authorized to view this deal") error.statusCode = 403;
    next(error);
  }
}

export const getAllBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as "admin" | "user" | undefined;

    const { search, userId: targetUserId, status, page, limit } = req.query;

    if (!userId || !role) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const result = await getallDealsService(
      userId as string,
      role as "admin" | "user",
      { search, userId: targetUserId, status, page: pageNum, limit: limitNum }
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Deals fetched successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateDealStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealId = req.params.dealId as string;
    const { status } = req.body;

    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as "admin" | "user" | undefined;

    if (!dealId) {
      const err: any = new Error("Deal ID is required");
      err.statusCode = 400;
      return next(err);
    }

    const allowedStatuses = [
      "CREATED",
      "PAYMENT_PENDING",
      "IN_ESCROW",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
      "DISPUTED",
      "CANCELLED",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      const err: any = new Error("Status is required and must be one of: " + allowedStatuses.join(", "));
      err.statusCode = 400;
      return next(err);
    }

    if (!userId || !role) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const updatedDeal = await updateDealStatusService(
      dealId,
      status as any,
      userId as string,
      role as "admin" | "user"
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Deal status updated successfully",
      data: updatedDeal,
    });
  } catch (error: any) {
    const msg = error?.message;
    if (msg === "Invalid deal id" || msg === "Deal is already completed or cancelled and cannot be changed") error.statusCode = 400;
    else if (msg === "Deal not found") error.statusCode = 404;
    else if (msg === "You are not authorized to update this deal" || msg === "Only admin can change status of a disputed deal") error.statusCode = 403;
    next(error);
  }
};

export const downloadPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dealIdParam = req.params.dealId as string | string[] | undefined;
    const dealId = Array.isArray(dealIdParam) ? dealIdParam[0] : dealIdParam;
    const userId = (req as any).user?.id as string | undefined;
    const role = (req as any).userRole as "admin" | "user" | undefined;

    if (!dealId) {
      const err: any = new Error("Deal ID is required");
      err.statusCode = 400;
      throw err;
    }

    const deal = await getDealByIdService(
      dealId,
      userId as string,
      role as "admin" | "user"
    );

    const html = getDealInvoiceHtml(deal);
    const pdfBuffer = await htmlToPdfBuffer(html);

    const cloudUrl = await uploadBufferToCloudinary(
      pdfBuffer,
      "deal-summaries",
      `deal-${deal._id}`
    );

    // Always use .pdf extension so OS and clients recognize the file type
    const safeId = String(deal._id).replace(/[^a-zA-Z0-9-]/g, "");
    const pdfFilename = `deal-${safeId}.pdf`;

    await dealDownloadService(deal, cloudUrl);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", String(pdfBuffer.length));
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFilename}"; filename*=UTF-8''${encodeURIComponent(pdfFilename)}`
    );
    res.setHeader("X-Suggested-Filename", pdfFilename);
    res.setHeader("X-Deal-Pdf-Url", cloudUrl);
    res.status(200);
    return res.end(pdfBuffer, "binary");
  } catch (error: any) {
    const msg = error?.message;
    if (msg === "Invalid deal id") error.statusCode = 400;
    else if (msg === "Deal not found") error.statusCode = 404;
    else if (msg === "You are not authorized to view this deal") error.statusCode = 403;
    next(error);
  }
};

export const cancelDeal = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).userRole;

    const result = await cancelDealService(
      req.params.dealId,
      userId,
      role
    );

    // Notify buyer and seller
    notifyDealCancelled(req.params.dealId).catch((err) =>
      console.error("Failed to send deal cancellation notification:", err)
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Deal cancelled successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const raiseDispute = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).userRole;

    const { reason } = req.body;

    if (!reason) {
      throw new Error("Dispute reason is required");
    }

    const deal = await raiseDisputeService(
      req.params.dealId,
      reason,
      userId,
      role
    );

    // Notify buyer, seller, and admins
    notifyDisputeRaised(req.params.dealId, reason).catch((err) =>
      console.error("Failed to send dispute raised notification:", err)
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Dispute raised successfully",
      data: deal,
    });
  } catch (error: any) {
    next(error);
  }
};

export const resolveDispute = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).userRole;

    const { resolution: rawResolution, adminNote } = req.body;

    if (!rawResolution) {
      throw new Error("Resolution is required");
    }

    const resolution = typeof rawResolution === "string" ? rawResolution.trim() : rawResolution;

    if (!["REFUND_BUYER", "RELEASE_SELLER"].includes(resolution)) {
      console.log("Invalid resolution:", resolution); // Why is it invalid?
      const err: any = new Error(`Invalid resolution type. Received: '${resolution}' (type: ${typeof resolution}). Must be REFUND_BUYER or RELEASE_SELLER`);
      err.statusCode = 400;
      throw err;
    }

    const result = await resolveDisputeService(
      req.params.dealId,
      resolution,
      adminNote || "",
      userId,
      role
    );

    // Notify buyer and seller
    notifyDisputeResolved(req.params.dealId, resolution).catch((err) =>
      console.error("Failed to send dispute resolution notification:", err)
    );

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Dispute resolved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const directDealCreation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = req.params.auctionId as string;
    const buyerId = (req as any).user?.id as string | undefined;

    if (!buyerId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    if (!auctionId) {
      const err: any = new Error("Auction ID is required");
      err.statusCode = 400;
      throw err;
    }

    // 1. Get the Auction to find out the price
    const { getAuctionByIdService } = await import("../services/auction.service.js");
    const { createBidService, updateBidStatusService } = await import("../services/bid.service.js");
    const { createSystemDealService } = await import("../services/deal.service.js");

    const auction = await getAuctionByIdService(auctionId);

    // We assume the Buy It Now price is highestBidPrice OR basePrice.
    const price = (auction.highestBidPrice && auction.highestBidPrice > 0) ? auction.highestBidPrice : auction.basePrice;

    // 2. Programmatically create the "Buy It Now" bid
    const bid = await createBidService({
      auctionId,
      buyerId,
      bidAmount: price,
      role: "user"
    });

    if (!bid || !bid._id) {
      throw new Error("Failed to create direct bid");
    }

    // 3. Programmatically accept the bid
    // Notice: we bypass standard permissions since this is a system-level direct buy action
    const updatedBid = await updateBidStatusService(
      bid._id.toString(),
      "ACCEPTED",
      (auction.inventoryId as any).sellerId.toString(), // spoof the seller's authority to accept
      "admin" // spoof admin role to ensure success bypassing normal seller checks if needed.
    );

    if (!updatedBid || updatedBid.status !== "ACCEPTED") {
      throw new Error("Failed to auto-accept direct deal bid");
    }

    // 4. Create the final Deal
    const deal = await createSystemDealService(bid._id.toString());

    // Fire notifications
    notifyDealCreated(deal).catch((err: any) =>
      console.error("Deal notification failed:", err)
    );

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      message: "Direct Deal created successfully",
      data: deal,
    });
  } catch (error: any) {
    if (error.message === "Inventory not found" || error.message === "Auction not found") {
      error.statusCode = 404;
    } else {
      error.statusCode = 400;
    }
    next(error);
  }
};