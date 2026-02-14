import type { Request, Response } from "express";
import sendResponse from "../utils/api.response.js";
import { updateUserStatusService } from "../services/admin-user.service.js";

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
