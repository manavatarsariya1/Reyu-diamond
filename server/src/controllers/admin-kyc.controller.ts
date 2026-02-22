import type { Request, Response } from "express";
import sendResponse from "../utils/api.response.js";
import { reviewKycService, getAllKycService } from "../services/kyc-admin.service.js";
import { logService } from "../services/log.service.js";
import { notifyUserKycStatus } from "../services/notification.service.js";

export const reviewKyc = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body as {
      status?: "approved" | "rejected" | "pending";
      rejectionReason?: string;
    };

    if (!userId || typeof userId !== "string") {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return sendResponse({
        res,
        statusCode: 400,
        success: false,
        message: "Invalid status",
      });
    }

    const kyc = await reviewKycService({
      userId,
      status,
      ...(rejectionReason !== undefined ? { rejectionReason } : {}),
    });

    // Log admin actions
    if (status === "approved") {
      await logService.createAdminLog({
        adminId: (req as any).user.id,
        action: "KYC_APPROVED",
        targetType: "KYC",
        targetId: kyc._id as any,
        description: "KYC approved"
      });

      await logService.createAdminLog({
        adminId: (req as any).user.id,
        action: "USER_APPROVED",
        targetType: "USER",
        targetId: userId as any,
        description: "User approved after KYC verification"
      });
    } else if (status === "rejected") {
      await logService.createAdminLog({
        adminId: (req as any).user.id,
        action: "KYC_REJECTED",
        targetType: "KYC",
        targetId: kyc._id as any,
        description: `KYC rejected. Reason: ${rejectionReason}`
      });
    }

    // Notify user about KYC status update
    if (status === "approved" || status === "rejected") {
      notifyUserKycStatus(userId, status, rejectionReason).catch((err: any) =>
        console.error("Failed to send KYC status notification:", err)
      );
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: `KYC ${status} successfully`,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: error?.message === "KYC record not found" ? 404 : 500,
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};

export const getAllKyc = async (req: Request, res: Response) => {
  try {
    const { page, limit, status } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const result = await getAllKycService({
      page: pageNum,
      limit: limitNum,
      status: status as any,
    });

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "KYC records retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to retrieve KYC records",
      errors: error.message || "Something went wrong",
    });
  }
};

