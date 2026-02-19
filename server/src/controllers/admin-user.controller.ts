import type { Request, Response } from "express";
import sendResponse from "../utils/api.response.js";
import { updateUserStatusService, getAllUsersService, getAuctionBidsByUserIdService, getAllBidsOfUserService, getAllRatingsAndBadgesService } from "../services/admin-user.service.js";
import { logService } from "../services/log.service.js";

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!userId) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: "User ID is required",
            });
        }

        if (!["ACTIVE", "DEACTIVE"].includes(status)) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: "Invalid status. Allowed values: ACTIVE, DEACTIVE",
            });
        }

        const user = await updateUserStatusService({
            userId: userId as string,
            status: status as "ACTIVE" | "DEACTIVE"
        });

        // Log the admin action
        await logService.createAdminLog({
            adminId: (req as any).user.id,
            action: status === "ACTIVE" ? "USER_REACTIVATED" : "USER_DEACTIVED",
            targetType: "USER",
            targetId: user._id as any,
            description: `User status updated to ${status}`
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: `User status updated to ${status}`,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                accountStatus: user.accountStatus
            },
        });

    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: "User not found",
            });
        }
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: "Failed to update user status",
            errors: error.message || "Something went wrong",
        });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { page, limit, search, role, status, kycVerified, isVerified, accountStatus } = req.query;

        // Convert query params to appropriate types
        const pageNum = page ? parseInt(page as string) : 1;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const isKycVerified = kycVerified === "true" ? true : kycVerified === "false" ? false : undefined;
        const isEmailVerified = isVerified === "true" ? true : isVerified === "false" ? false : undefined;
        const isAccountStatusActive = accountStatus === "ACTIVE" ? true : accountStatus === "DEACTIVE" ? false : undefined;

        const result = await getAllUsersService({
            page: pageNum,
            limit: limitNum,
            search: search as string,
            role: role as string,
            accountStatus: status as string, // Map status query param to accountStatus
            isKycVerified,
            isEmailVerified,
            isAccountStatusActive
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });

    } catch (error: any) {
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: "Failed to retrieve users",
            errors: error.message || "Something went wrong",
        });
    }
};


export const getActionBidsByUserId = async (req: Request, res: Response) => {
    try {
        const { auctionId, userId } = req.params;
        const { page, limit, status } = req.query;

        if (!auctionId || !userId) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: "Auction ID and User ID are required",
            });
        }

        const pageNum = page ? parseInt(page as string) : 1;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const result = await getAuctionBidsByUserIdService(auctionId as string, userId as string, {
            page: pageNum,
            limit: limitNum,
            status: status as string
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "User bids retrieved successfully",
            data: result,
        });

    } catch (error: any) {
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: "Failed to retrieve user bids",
            errors: error.message || "Something went wrong",
        });
    }
};

export const getAllBidsOfUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { page, limit, status } = req.query;

        if (!userId) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: "User ID is required",
            });
        }

        const pageNum = page ? parseInt(page as string) : 1;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const result = await getAllBidsOfUserService(userId as string, {
            page: pageNum,
            limit: limitNum,
            status: status as string
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "User bids retrieved successfully",
            data: result,
        });

    } catch (error: any) {
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: "Failed to retrieve user bids",
            errors: error.message || "Something went wrong",
        });
    }
};

export const getAllRatingsAndBadges = async (req: Request, res: Response) => {
    try {
        const { page, limit, search } = req.query;

        const pageNum = page ? parseInt(page as string) : 1;
        const limitNum = limit ? parseInt(limit as string) : 10;

        const result = await getAllRatingsAndBadgesService({
            page: pageNum,
            limit: limitNum,
            search: search as string
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Ratings and badges retrieved successfully",
            data: result,
        });

    } catch (error: any) {
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: "Failed to retrieve ratings and badges",
            errors: error.message || "Something went wrong",
        });
    }
}; 