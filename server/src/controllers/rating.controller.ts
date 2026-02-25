import type { Request, Response, NextFunction } from "express";
import { ratingService } from "../services/rating.service.js";

export const createRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validation is handled by middleware
        const { dealId, score, feedback } = req.body;
        const raterId = (req as any).user?.id;

        const rating = await ratingService.createRating(
            raterId,
            dealId,
            score,
            feedback
        );

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            rating,
        });
    } catch (error: any) {
        next(error);
    }
};

export const getUserRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (typeof userId !== "string") {
            const err: any = new Error("Invalid user ID");
            err.statusCode = 400;
            throw err;
        }

        const ratings = await ratingService.getUserRatings(userId);

        res.status(200).json({
            success: true,
            ratings,
        });
    } catch (error: any) {
        next(error);
    }
};
