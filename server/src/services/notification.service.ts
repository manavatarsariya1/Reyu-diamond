import { fcm } from "../config/firebase-admin.config.js";
import User from "../models/User.model.js";

export const notifyAdminsForKyc = async (userId: string) => {
  const admins = await User.find({
    role: "admin",
    fcmToken: { $ne: null }
  });

  for (const admin of admins) {
    try {
      if (!admin.fcmToken) continue;
        console.log(`Sending KYC notification to admin ${admin._id} with token ${admin.fcmToken}`);
        await fcm.send({
            token: admin.fcmToken,
            notification: {
          title: "New KYC Submission",
          body: `User with ID ${userId} submitted KYC.`,
        },
        data: {
          type: "KYC_PENDING",
          userId
        }
      });

      console.log(`Notification sent to admin ${admin._id}`);
    } catch (error: any) {

      console.log("FCM Error:", error.message);

      // Remove invalid tokens or mismatched sender ID
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.message.includes("SenderId mismatch") || 
        error.code === "messaging/mismatched-credential"
      ) {
        console.log(`Removing invalid token for admin ${admin._id}`);
        await User.updateOne(
          { _id: admin._id },
          { $unset: { fcmToken: "" } }
        );
      }
    }
  }
};