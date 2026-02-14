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
