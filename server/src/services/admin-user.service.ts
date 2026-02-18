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
