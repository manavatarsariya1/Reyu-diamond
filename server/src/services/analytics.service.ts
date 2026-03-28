import mongoose from "mongoose";
import User from "../models/User.model.js";
import { Auction } from "../models/Auction.model.js";
import { default as Deal, type DealStatus } from "../models/Deal.model.js";
import KYC, { type KycStatus } from "../models/kyc.model.js";
import Inventory from "../models/Inventory.model.js";
import Bid from "../models/Bid.model.js";
import { Advertisement } from "../models/Advertisement.model.js";

export class DashboardService {
    async getUserStats(status?: "ACTIVE" | "DEACTIVE") {
        if (status) {
            const count = await User.countDocuments({
                role: "user",
                accountStatus: status,
            });

            return {
                totalActiveUsers: status === "ACTIVE" ? count : undefined,
                totalInactiveUsers: status === "DEACTIVE" ? count : undefined,
            };
        }

        const [active, inactive] = await Promise.all([
            User.countDocuments({ role: "user", accountStatus: "ACTIVE" }),
            User.countDocuments({ role: "user", accountStatus: "DEACTIVE" }),
        ]);

        return {
            totalActiveUsers: active,
            totalInactiveUsers: inactive,
        };
    }

    async getAuctionStats(
        auctionStatus?: "ACTIVE" | "CLOSED" | "CANCELLED"
    ) {
        if (auctionStatus) {
            const count = await Auction.countDocuments({ status: auctionStatus });

            return {
                activeAuctions: auctionStatus === "ACTIVE" ? count : undefined,
                closedAuctions: auctionStatus === "CLOSED" ? count : undefined,
                cancelledAuctions: auctionStatus === "CANCELLED" ? count : undefined,
            };
        }

        const [active, closed, cancelled] = await Promise.all([
            Auction.countDocuments({ status: "ACTIVE" }),
            Auction.countDocuments({ status: "CLOSED" }),
            Auction.countDocuments({ status: "CANCELLED" }),
        ]);

        return {
            activeAuctions: active,
            closedAuctions: closed,
            cancelledAuctions: cancelled,
        };
    }

    async getDealStats() {
        const activeDeals = await Deal.countDocuments({
            status: {
                $in: [
                    "CREATED",
                    "PAYMENT_PENDING",
                    "IN_ESCROW",
                    "SHIPPED",
                    "DELIVERED",
                    "DISPUTED",
                ] as DealStatus[],
            },
        });

        const [completed, volume] = await Promise.all([
            Deal.aggregate([
                { $match: { status: "COMPLETED" } },
                { $group: { _id: null, count: { $sum: 1 } } },
            ]),
            Deal.aggregate([
                { $match: { status: "COMPLETED" } },
                { $group: { _id: null, totalVolume: { $sum: "$agreedAmount" } } },
            ]),
        ]);

        return {
            activeDeals,
            completedDeals: completed[0]?.count || 0,
            totalVolume: volume[0]?.totalVolume || 0,
        };
    }

    async getKycStats(kycStatus?: any) {
        if (kycStatus) {
            const count = await KYC.countDocuments({ status: kycStatus });

            return {
                totalKyc: count,
                pendingKyc: kycStatus === "pending" ? count : undefined,
                approvedKyc: kycStatus === "approved" ? count : undefined,
                rejectedKyc: kycStatus === "rejected" ? count : undefined,
            };
        }

        const [pending, approved, rejected] = await Promise.all([
            KYC.countDocuments({ status: "pending" }),
            KYC.countDocuments({ status: "approved" }),
            KYC.countDocuments({ status: "rejected" }),
        ]);

        return {
            totalKyc: pending + approved + rejected,
            pendingKyc: pending,
            approvedKyc: approved,
            rejectedKyc: rejected,
        };
    }

    async getInventoryStats(
        inventoryStatus?: "AVAILABLE" | "NOT_AVAILABLE" | "LISTED" | "SOLD" | "ON_MEMO"
    ) {
        if (inventoryStatus) {
            const count = await Inventory.countDocuments({ status: inventoryStatus });

            return {
                totalInventory: count,
                availableInventory: inventoryStatus === "AVAILABLE" ? count : undefined,
                notAvailableInventory: inventoryStatus === "NOT_AVAILABLE" ? count : undefined,
                listedAuctionInventory: inventoryStatus === "LISTED" ? count : undefined,
                onMemoInventory: inventoryStatus === "ON_MEMO" ? count : undefined,
                soldInventory: inventoryStatus === "SOLD" ? count : undefined,
            };
        }

        const [available, sold] = await Promise.all([
            Inventory.countDocuments({ status: "AVAILABLE" }),
            Inventory.countDocuments({ status: "SOLD" }),
        ]);

        return {
            totalInventory: available + sold,
            availableInventory: available,
            soldInventory: sold,
        };
    }

    async getBidStats(bidStatus?: "ACCEPTED") {
        if (!bidStatus) return { acceptedBids: undefined };

        const count = await Bid.countDocuments({ bidStatus });
        return { acceptedBids: count };
    }

    async getAdStats() {
        const [pending, total] = await Promise.all([
            Advertisement.countDocuments({ status: "PENDING" }),
            Advertisement.countDocuments({}),
        ]);

        return {
            pendingAds: pending,
            totalAds: total
        };
    }

    async getDashboardStats(
        status?: "ACTIVE" | "DEACTIVE",
        auctionStatus?: "ACTIVE" | "CLOSED" | "CANCELLED",
        kycStatus?: any,
        inventoryStatus?: "AVAILABLE" | "NOT_AVAILABLE" | "LISTED" | "SOLD" | "ON_MEMO",
        bidStatus?: "ACCEPTED"
    ) {
        const [
            userStats,
            auctionStats,
            dealStats,
            kycStats,
            inventoryStats,
            bidStats,
            adStats,
        ] = await Promise.all([
            this.getUserStats(status),
            this.getAuctionStats(auctionStatus),
            this.getDealStats(),
            this.getKycStats(kycStatus),
            this.getInventoryStats(inventoryStatus),
            this.getBidStats(bidStatus),
            this.getAdStats(),
        ]);

        return {
            ...userStats,
            ...auctionStats,
            ...dealStats,
            ...kycStats,
            ...inventoryStats,
            ...bidStats,
            ...adStats,
        };
    }

    async getUserDashboardStats(userId: string) {
        const uid = new mongoose.Types.ObjectId(userId);

        const [
            totalBids,
            activeBids,
            totalDeals,
            activeDeals,
            totalInventory,
            kyc,
            recentBids,
            recentDeals
        ] = await Promise.all([
            Bid.countDocuments({ buyerId: uid }),
            Bid.countDocuments({ buyerId: uid, status: "SUBMITTED" }),
            Deal.countDocuments({ $or: [{ buyerId: uid }, { sellerId: uid }] }),
            Deal.countDocuments({ 
                $or: [{ buyerId: uid }, { sellerId: uid }],
                status: { $nin: ["COMPLETED", "CANCELLED"] }
            }),
            Inventory.countDocuments({ sellerId: uid }),
            KYC.findOne({ userId: uid }),
            Bid.find({ buyerId: uid })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate({
                    path: "auctionId",
                    populate: { path: "inventoryId", select: "title shape carat price" }
                }),
            Deal.find({ $or: [{ buyerId: uid }, { sellerId: uid }] })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("buyerId", "username")
                .populate("sellerId", "username")
                .populate({
                    path: "auctionId",
                    populate: { path: "inventoryId", select: "title shape carat" }
                })
        ]);

        return {
            stats: {
                totalBids,
                activeBids,
                totalDeals,
                activeDeals,
                totalInventory,
                kycStatus: kyc?.status || "not_started"
            },
            recentBids,
            recentDeals
        };
    }
}

class AnalyticsService {
    /**
     * Get revenue analytics (volume) over time
     */
    async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
        const filter: any = { status: "COMPLETED" };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }

        const revenueStats = await Deal.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    dailyVolume: { $sum: "$agreedAmount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return revenueStats.map((stat) => ({
            date: stat._id,
            volume: stat.dailyVolume,
            count: stat.count,
        }));
    }
}

export const analyticsService = new AnalyticsService();
export const dashboardService = new DashboardService();
