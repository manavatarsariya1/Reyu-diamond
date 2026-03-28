import type { Request, Response, NextFunction } from "express";
import * as advertisementService from "../services/advertisement.service.js"; // Correct import path
import { logService } from "../services/log.service.js";
import { createAdvertisementSchema, updateAdvertisementStatusSchema, getAdvertisementsSchema } from "../validation/advertisement.validation.js";
import sendResponse from "../utils/api.response.js";
import User from "../models/User.model.js";
import { notifyAdminsNewAdvertisement, notifyAdOwnerStatusUpdate } from "../services/notification.service.js";

export const createAdvertisement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = (req as any).user.id;

        const validatedData = createAdvertisementSchema.parse({
            body: req.body
        });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        let file: Express.Multer.File | undefined;

        if (files) {
            file = files["media"]?.[0] || files["image"]?.[0] || files["video"]?.[0] || files["mediaUrl"]?.[0];
        }

        if (!file && !req.body.mediaUrl) {
            next(Object.assign(new Error("Media file or URL is required"), { statusCode: 400 }));
        }

        const advertisement = await advertisementService.createAdvertisement(
            userId,
            validatedData.body,
            file
        );

        // Notify admins about new advertisement submission
        const user = await User.findById(userId).select("username");
        const advertiserName = user ? user.username : "A user";

        notifyAdminsNewAdvertisement(advertisement._id?.toString() || "", advertiserName).catch((err) =>
            console.error("Failed to send advertisement notification:", err)
        );

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: "Advertisement created successfully",
            data: advertisement
        });
    } catch (error) {
        next(error);
    }
};

export const getAdvertisements = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const validatedQuery = getAdvertisementsSchema.parse({
            query: req.query
        });

        const loggedInUser = (req as any).user;
        const userRole = (req as any).userRole || loggedInUser.role;
        let userId = undefined;

        // If admin, they can see all. If not admin, they only see their own.
        // If admin provides a specific userId in params, fetch for that user.
        if (userRole === 'admin') {
            if (req.params.userId) {
                userId = req.params.userId;
            }
        } else {
            userId = loggedInUser.id;
        }

        const query = {
            ...validatedQuery.query,
            advertiserId: userId
        };

        const result = await advertisementService.getAdvertisements(query as any);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Advertisements fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getAdvertisementById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { advertisementId } = req.params;
        if (!advertisementId) {
            next(Object.assign(new Error("Advertisement ID is required"), { statusCode: 400 }));
        }
        const advertisement = await advertisementService.getAdvertisementById(advertisementId as string);
        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Advertisement details fetched successfully",
            data: advertisement
        });
    } catch (error) {
        next(error);
    }
};

export const updateAdvertisementStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // Validate request
        const validatedData = updateAdvertisementStatusSchema.parse({
            params: req.params,
            body: req.body
        });

        const { advertisementId } = validatedData.params;
        const { status, rejectionReason } = validatedData.body;

        const advertisement = await advertisementService.updateAdvertisementStatus(
            advertisementId,
            status as "APPROVED" | "REJECTED" | "DISABLED",
            rejectionReason
        );

        // Notify ad owner about status update
        notifyAdOwnerStatusUpdate(advertisementId, status, rejectionReason).catch((err) =>
            console.error("Failed to send advertisement status notification:", err)
        );

        let action: "AD_APPROVED" | "AD_REJECTED" | "AD_DISABLED" | null = null;
        let description = "";

        if (status === "APPROVED") {
            action = "AD_APPROVED";
            description = "Advertisement approved";
        } else if (status === "REJECTED") {
            action = "AD_REJECTED";
            description = `Advertisement rejected.Reason: ${rejectionReason} `;
        } else if (status === "DISABLED") {
            action = "AD_DISABLED";
            description = "Advertisement disabled";
        }

        if (action) {
            await logService.createAdminLog({
                adminId: (req as any).user.id,
                action: action,
                targetType: "ADVERTISEMENT",
                targetId: advertisementId as any,
                description: description
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Advertisement status updated successfully",
            data: advertisement
        });
    } catch (error) {
        next(error);
    }
};

export const getActiveAdvertisements = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { section } = req.query;
        const result = await advertisementService.getAdvertisements({
            status: "APPROVED",
            section: section as string
        });

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Active advertisements fetched successfully",
            data: result.advertisements
        });
    } catch (error) {
        next(error);
    }
};
export const deleteAdvertisement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { advertisementId } = req.params;
        await advertisementService.deleteAdvertisement(advertisementId as string);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: "Advertisement deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
