import type { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification.model.js";
import sendResponse from "../utils/api.response.js";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await Notification.countDocuments({ recipient: userId });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Notifications retrieved successfully",
            data: {
                notifications,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId } as any,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            const err: any = new Error("Notification not found");
            err.statusCode = 404;
            throw err;
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error: any) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error: any) {
        next(error);
    }
};
