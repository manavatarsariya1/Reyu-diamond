import { Auction } from "../models/Auction.model.js";
import Bid from "../models/Bid.model.js";
import User from "../models/User.model.js";

interface IUpdateUserStatus {
    userId: string;
    status: "ACTIVE" | "DEACTIVE";
}

export const updateUserStatusService = async ({ userId, status }: IUpdateUserStatus) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.accountStatus = status;
    await user.save();

    return user;
};

interface IGetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    accountStatus?: string;
    isKycVerified?: boolean | undefined;
    isEmailVerified?: boolean | undefined;
    isAccountStatusActive?: boolean | undefined;
}

export const getAllUsersService = async ({
    page = 1,
    limit = 10,
    search,
    role,
    accountStatus,
    isKycVerified,
    isEmailVerified,
    isAccountStatusActive
}: IGetAllUsersParams) => {
    const query: any = {};

    if (role) {
        query.role = role;
    }

    if (accountStatus) query.accountStatus = accountStatus;
    if (isKycVerified !== undefined) query.isKycVerified = isKycVerified;
    if (isEmailVerified !== undefined) query.isVerified = isEmailVerified;
    if (isAccountStatusActive !== undefined) query.accountStatus = isAccountStatusActive;

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
        .select("-password -otp -stripeAccountId") // Exclude sensitive fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(query);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const getAuctionBidsByUserIdService = async (
    auctionId: string,
    userId: string,
    query: any = {}
): Promise<{ bids: any[]; total: number; pages: number }> => {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
        throw new Error("Auction not found");
    }

    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = { auctionId, buyerId: userId };
    if (status) {
        filter.status = status;
    }

    const bids = await Bid.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("buyerId", "username email");

    const total = await Bid.countDocuments(filter);

    return {
        bids,
        total,
        pages: Math.ceil(total / limit),
    };
};

export const getAllBidsOfUserService = async (
    userId: string,
    query: any = {}
): Promise<{ bids: any[]; total: number; pages: number }> => {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = { buyerId: userId };
    if (status) {
        filter.status = status;
    }

    const bids = await Bid.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("auctionId")
        .populate("buyerId", "username email");

    const total = await Bid.countDocuments(filter);

    return {
        bids,
        total,
        pages: Math.ceil(total / limit),
    };
};

export const getAllRatingsAndBadgesService = async (
    query: any = {}
): Promise<{ users: any[]; total: number; pages: number }> => {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = { role: "user" }; // Only fetch regular users

    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const users = await User.find(filter)
        .select("username email rating badges")
        .sort({ "rating.average": -1 }) // Sort by highest rating
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(filter);

    return {
        users: users.map(user => ({
            userId: user._id,
            name: user.username,
            email: user.email,
            rating: user.rating?.average || 0,
            badge: user.badges || []
        })),
        total,
        pages: Math.ceil(total / limit),
    };
};