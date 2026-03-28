import type { Request, Response, NextFunction } from "express";
import { analyticsService, dashboardService } from "../services/analytics.service.js";
import sendResponse from "../utils/api.response.js";

export const getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status, auctionStatus, kycStatus, inventoryStatus, bidStatus } = req.query;
        const stats = await dashboardService.getDashboardStats(
            status as "ACTIVE" | "DEACTIVE",
            auctionStatus as "ACTIVE" | "CLOSED" | "CANCELLED",
            kycStatus as "pending" | "approved" | "rejected",
            inventoryStatus as "AVAILABLE" | "NOT_AVAILABLE" | "LISTED" | "SOLD" | "ON_MEMO",
            bidStatus as "ACCEPTED"
        );

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Dashboard stats fetched successfully",
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export const getRevenueAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

        const analytics = await analyticsService.getRevenueAnalytics(
            startDate,
            endDate
        );

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Revenue analytics fetched successfully",
            data: analytics,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            const err: any = new Error("Unauthorized");
            err.statusCode = 401;
            throw err;
        }

        const stats = await dashboardService.getUserDashboardStats(userId);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "User dashboard stats fetched successfully",
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};
