import Kyc, { type KycStatus } from "../models/kyc.model.js";
import User from "../models/User.model.js";

interface ReviewKycInput {
  userId: string;
  status: KycStatus;
  rejectionReason?: string;
}

interface IGetAllKycParams {
  page?: number;
  limit?: number;
  status?: KycStatus;
}

export const reviewKycService = async ({
  userId,
  status,
  rejectionReason,
}: ReviewKycInput) => {
  const kyc = await Kyc.findOne({ userId });

  if (!kyc) {
    throw new Error("KYC record not found");
  }

  kyc.status = status;
  kyc.rejectionReason = status === "rejected" ? (rejectionReason ?? "") : "";
  await kyc.save();

  if (status === "approved") {
    await User.findByIdAndUpdate(userId, { isVerified: true, isKycVerified: true });
  } else {
    await User.findByIdAndUpdate(userId, { isKycVerified: false });
  }

  return kyc;
};

export const getAllKycService = async ({
  page = 1,
  limit = 10,
  status,
}: IGetAllKycParams) => {
  const query: any = {};

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const kycRecords = await Kyc.find(query)
    .populate("userId", "username email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Kyc.countDocuments(query);

  return {
    kycRecords,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

