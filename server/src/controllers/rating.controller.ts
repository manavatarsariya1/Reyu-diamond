import type { Request, Response } from "express";
import { ratingService } from "../services/rating.service.js";

export const createRating = async (req: Request, res: Response) => {
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
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getUserRatings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (typeof userId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const ratings = await ratingService.getUserRatings(userId);

        res.status(200).json({
            success: true,
            ratings,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
