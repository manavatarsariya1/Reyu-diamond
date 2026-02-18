import type { NextFunction, Request, Response } from "express";
import { logService } from "../services/log.service.js";
import sendResponse from "../utils/api.response.js";

class LogController {
    /**
     * Get Admin Logs
     */
    async getAdminLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const filter: any = {};

            // Filter by adminId
            if (req.query.adminId) {
                filter.adminId = req.query.adminId;
            }

            // Filter by action
            if (req.query.action) {
                filter.action = req.query.action;
            }

            // Filter by targetType
            if (req.query.targetType) {
                filter.targetType = req.query.targetType;
            }

            // Filter by targetId
            if (req.query.targetId) {
                filter.targetId = req.query.targetId;
            }

            // Filter by date range
            if (req.query.startDate || req.query.endDate) {
                filter.createdAt = {};
                if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate as string);
                if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate as string);
            }

            const result = await logService.getAdminLogs(filter, page, limit);

            sendResponse({
                res,
                statusCode: 200,
                success: true,
                message: "Admin logs retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get System Logs
     */
    async getSystemLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const filter: any = {};

            // Filter by eventType
            if (req.query.eventType) {
                filter.eventType = req.query.eventType;
            }

            // Filter by severity
            if (req.query.severity) {
                filter.severity = req.query.severity;
            }

            // Filter by date range
            if (req.query.startDate || req.query.endDate) {
                filter.createdAt = {};
                if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate as string);
                if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate as string);
            }

            const result = await logService.getSystemLogs(filter, page, limit);

            sendResponse({
                res,
                statusCode: 200,
                success: true,
                message: "System logs retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get System Log Statistics
     */
    async getSystemStats(req: Request, res: Response, next: NextFunction) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

            const result = await logService.getSystemLogStats(startDate, endDate);

            sendResponse({
                res,
                statusCode: 200,
                success: true,
                message: "System log statistics retrieved successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export const logController = new LogController();
