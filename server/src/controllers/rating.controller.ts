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

        const ratings = await ratingService.getUserRatings(userId as string);

        res.status(200).json({
            success: true,
            ratings,
        });
    } catch (error: any) {
        next(error);
    }
};

export const getUserReputation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (typeof userId !== "string") {
            const err: any = new Error("User ID is required");
            err.statusCode = 400;
            throw err;
        }

        const reputation = await ratingService.getUserReputation(userId as string);

        res.status(200).json({
            success: true,
            message: "Reputation fetched successfully",
            data: reputation,
        });
    } catch (error: any) {
        next(error);
    }
};

export const getRatingByUserAndDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealId } = req.params;
        const raterId = (req as any).user?.id;

        if (typeof dealId !== "string") {
            const err: any = new Error("Deal ID is required");
            err.statusCode = 400;
            throw err;
        }

        const rating = await ratingService.getRatingByDeal(dealId as string, raterId);

        res.status(200).json({
            success: true,
            rated: !!rating,
            rating: rating || null,
        });
    } catch (error: any) {
        next(error);
    }
};
