import Kyc, { type KycStatus } from "../models/kyc.model.js";
import User from "../models/User.model.js";

interface ReviewKycInput {
  userId: string;
  status: KycStatus;
  rejectionReason?: string;
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

