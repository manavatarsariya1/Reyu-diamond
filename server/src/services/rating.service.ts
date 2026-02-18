import mongoose from "mongoose";
import Rating from "../models/Rating.model.js";
import User from "../models/User.model.js";
import Deal from "../models/Deal.model.js";

class RatingService {
    async createRating(
        raterId: string,
        dealId: string,
        score: number,
        feedback?: string
    ) {
        const useTransaction = process.env.NODE_ENV === "production";
        const session = useTransaction ? await mongoose.startSession() : undefined;
        if (session) {
            session.startTransaction();
        }

        try {
            // 1. Validate Deal
            const deal = await Deal.findById(dealId).session(session || null);
            if (!deal) {
                throw new Error("Deal not found");
            }

            if (deal.status !== "COMPLETED") {
                throw new Error("Deal must be completed to submit a rating");
            }

            let targetId: string;

            if (deal.buyerId.toString() === raterId) {
                targetId = deal.sellerId.toString();
            } else if (deal.sellerId.toString() === raterId) {
                targetId = deal.buyerId.toString();
            } else {
                throw new Error("User was not part of this deal");
            }

            // 2. Check for existing rating
            const existingRating = await Rating.findOne({
                dealId,
                raterId,
            }).session(session || null);

            if (existingRating) {
                throw new Error("You have already rated this deal");
            }

            // 3. Create Rating
            const rating = await Rating.create(
                [
                    {
                        dealId,
                        raterId,
                        targetId,
                        score,
                        ...(feedback ? { feedback } : {}),
                    },
                ],
                { session: session || null }
            );

            // 4. Update Target User's Aggregate Rating
            const targetUser = await User.findById(targetId).session(
                session || null
            );
            if (!targetUser) throw new Error("Target user not found");

            // Calculate new average
            // newAvg = ((oldAvg * oldCount) + newScore) / (oldCount + 1)
            const currentAvg = targetUser.rating?.average || 0;
            const currentCount = targetUser.rating?.count || 0;

            const newCount = currentCount + 1;
            const newAverage =
                (currentAvg * currentCount + score) / newCount;

            // Update User fields
            targetUser.rating = {
                average: parseFloat(newAverage.toFixed(2)), // Keep 2 decimal places
                count: newCount,
            };

            // 5. Assign Badges
            // const BADGE_TIERS = [
            //     { name: "IMMORTAL", count: 1000, avg: 4.98 },
            //     { name: "LEGEND", count: 500, avg: 4.95 },
            //     { name: "MASTER", count: 250, avg: 4.9 },
            //     { name: "DIAMOND", count: 100, avg: 4.75 },
            //     { name: "PLATINUM", count: 75, avg: 4.6 },
            //     { name: "GOLD", count: 50, avg: 4.4 },
            //     { name: "SILVER", count: 25, avg: 4.2 },
            //     { name: "BRONZE", count: 10, avg: 4.0 },
            //     { name: "ROOKIE", count: 1, avg: 3.5 }
            // ];

            // const BADGE_TIERS = [
            //     { name: "TOP_RATED_PLUS", count: 300, avg: 4.9 },
            //     { name: "TOP_RATED", count: 150, avg: 4.75 },
            //     { name: "PREMIUM", count: 80, avg: 4.6 },
            //     { name: "STANDARD", count: 30, avg: 4.3 },
            //     { name: "VERIFIED", count: 5, avg: 4.0 }
            // ];

            const BADGE_TIERS = [
                { name: "DIAMOND", count: 100, avg: 4.75 },
                { name: "PLATINUM", count: 50, avg: 4.5 },
                { name: "GOLD", count: 25, avg: 4.25 },
                { name: "SILVER", count: 10, avg: 4.0 },
                { name: "BRONZE", count: 5, avg: 3.75 }
            ];

            // Remove existing rank badges to ensure only highest is kept
            const RANK_BADGES = ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"];
            targetUser.badges = targetUser.badges.filter(b => !RANK_BADGES.includes(b));

            let assignedBadge = null;
            for (const tier of BADGE_TIERS) {
                if (newCount >= tier.count && newAverage >= tier.avg) {
                    assignedBadge = tier.name;
                    break; // Matched highest possible tier
                }
            }

            if (assignedBadge) {
                targetUser.badges.push(assignedBadge);
            }

            await targetUser.save({ session: session || null });
            if (session) {
                await session.commitTransaction();
            }

            return rating[0];
        } catch (error) {
            if (session) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            if (session) {
                session.endSession();
            }
        }
    }

    async getUserRatings(userId: string) {
        return await Rating.find({ targetId: userId })
            .populate("raterId", "username") // Show who rated
            .populate("dealId", "agreedAmount currency") // Show deal context
            .sort({ createdAt: -1 });
    }
}

export const ratingService = new RatingService();
