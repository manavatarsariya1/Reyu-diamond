import { fcm } from "../config/firebase-admin.config.js";
import User from "../models/User.model.js";
import { Auction } from "../models/Auction.model.js";
import Inventory from "../models/Inventory.model.js";
import type { IDeal } from "../models/Deal.model.js";
import type { IInventory } from "../models/Inventory.model.js";
import Requirement from "../models/requirement.model.js";
import { Advertisement } from "../models/Advertisement.model.js";
import type { ISystemLog } from "../models/SystemLog.model.js";

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

export const notifyAuctionOwnerNewBid = async ({
  auctionId,
  buyerName,
  bidAmount,
}: {
  auctionId: string;
  buyerName: string;
  bidAmount: number;
}) => {
  try {
    // Resolve auction owner from auctionId → inventory.sellerId
    const auction = await Auction.findById(auctionId).select("inventoryId");
    if (!auction) return;

    const inventory = await Inventory.findById(auction.inventoryId).select("sellerId");
    if (!inventory) return;

    const ownerId = inventory.sellerId.toString();
    const owner = await User.findById(ownerId).select("fcmToken");
    if (!owner?.fcmToken) return;

    await fcm.send({
      token: owner.fcmToken,
      notification: {
        title: "New Bid Received!",
        body: `${buyerName} placed a bid of ₹${bidAmount} on your auction.`,
      },
      data: {
        type: "NEW_BID",
        auctionId,
        bidAmount: String(bidAmount),
      },
    });
    console.log(`New bid notification sent to auction owner ${ownerId}`);
  } catch (error: any) {
    console.error("FCM Error (New Bid):", error.message);
    if (
      error.code === "messaging/registration-token-not-registered" ||
      error.message?.includes("SenderId mismatch") ||
      error.code === "messaging/mismatched-credential"
    ) {
      // Re-lookup owner to clear token
      const auc = await Auction.findById(auctionId).select("inventoryId");
      if (auc) {
        const inv = await Inventory.findById(auc.inventoryId).select("sellerId");
        if (inv) {
          await User.updateOne({ _id: inv.sellerId }, { $unset: { fcmToken: "" } });
        }
      }
    }
  }
};

export const notifyDealCreated = async (deal: IDeal) => {
  const sellerId = deal.sellerId.toString();
  const buyerId = deal.buyerId.toString();
  const dealId = deal._id.toString();

  const users = await User.find({
    _id: { $in: [sellerId, buyerId] },
    fcmToken: { $ne: null },
  });

  for (const user of users) {
    if (!user.fcmToken) continue;
    const isSeller = user._id.toString() === sellerId;
    const title = "Deal Created";
    const body = isSeller
      ? `A deal has been created for your bid (Deal ID: ${dealId}). Awaiting payment from buyer.`
      : `Your bid was accepted! A deal has been created (Deal ID: ${dealId}).`;

    try {
      await fcm.send({
        token: user.fcmToken,
        notification: { title, body },
        data: { type: "DEAL_CREATED", dealId },
      });
      console.log(`Deal created notification sent to user ${user._id}`);
    } catch (error: any) {
      console.log("FCM Error (Deal Created):", error.message);
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.message?.includes("SenderId mismatch") ||
        error.code === "messaging/mismatched-credential"
      ) {
        await User.updateOne({ _id: user._id }, { $unset: { fcmToken: "" } });
      }
    }
  }
};

export const notifyAllUsersNewAuction = async (auctionId: string) => {
  try {
    // Populate inventory details from auction
    const auction = await Auction.findById(auctionId).populate("inventoryId");
    if (!auction) return;

    const inv = auction.inventoryId as any;
    const shape = inv?.shape ?? "N/A";
    const carat = inv?.carat ?? "N/A";
    const color = inv?.color ?? "N/A";
    const clarity = inv?.clarity ?? "N/A";
    const lab = inv?.lab ?? "";
    const location = inv?.location ?? "";

    const start = new Date(auction.startDate).toLocaleDateString("en-IN");
    const end = new Date(auction.endDate).toLocaleDateString("en-IN");

    const title = "🔨 New Auction Live!";
    const body = `${shape} ${carat}ct | ${color} ${clarity}${lab ? ` | ${lab}` : ""}${location ? ` | ${location}` : ""} — Base: ₹${auction.basePrice} | ${start} → ${end}`;

    const data: Record<string, string> = {
      type: "NEW_AUCTION",
      auctionId: auctionId,
      basePrice: String(auction.basePrice),
      startDate: auction.startDate.toISOString(),
      endDate: auction.endDate.toISOString(),
      shape,
      carat: String(carat),
      color,
      clarity,
      lab,
      location,
    };

    // Fetch all users with valid FCM tokens (excluding auction owner)
    const ownerId = inv?.sellerId?.toString();
    const users = await User.find({
      fcmToken: { $ne: null },
      ...(ownerId ? { _id: { $ne: ownerId } } : {}),
    }).select("_id fcmToken");

    console.log(`Sending new auction notification to ${users.length} users`);

    for (const user of users) {
      if (!user.fcmToken) continue;
      try {
        await fcm.send({
          token: user.fcmToken,
          notification: { title, body },
          data,
        });
      } catch (error: any) {
        console.error(`FCM Error (New Auction) for user ${user._id}:`, error.message);
        if (
          error.code === "messaging/registration-token-not-registered" ||
          error.message?.includes("SenderId mismatch") ||
          error.code === "messaging/mismatched-credential"
        ) {
          await User.updateOne({ _id: user._id }, { $unset: { fcmToken: "" } });
        }
      }
    }
  } catch (error: any) {
    console.error("Error in notifyAllUsersNewAuction:", error.message);
  }
};

export const checkAndNotifyRequirements = async (inventory: IInventory) => {
  try {
    const matchingRequirements = await Requirement.find({
      shape: inventory.shape,
      color: inventory.color,
      clarity: inventory.clarity,
      carat: { $lte: inventory.carat }, // Requirement carat <= Inventory carat (Inventory is big enough)
      budget: { $gte: inventory.price } // Requirement budget >= Inventory price (Affordable)
    }).populate("userId", "fcmToken");

    console.log(`Found ${matchingRequirements.length} matching requirements for inventory ${inventory.barcode}`);

    for (const req of matchingRequirements) {
      const user = req.userId as any; // Populated

      if (user && user.fcmToken) {
        try {
          console.log(`Sending inventory match notification to user ${user._id}`);
          await fcm.send({
            token: user.fcmToken,
            notification: {
              title: "New Inventory Match!",
              body: `A new diamond matches your requirement: ${inventory.shape} ${inventory.carat}ct ${inventory.color} ${inventory.clarity}`,
            },
            data: {
              type: "INVENTORY_MATCH",
              inventoryId: inventory._id.toString(),
              requirementId: req._id.toString()
            }
          });
        } catch (error: any) {
          console.log("FCM Error (Inventory Match):", error.message);
          // Handle invalid tokens if needed, similar to notifyAdminsForKyc
          if (
            error.code === "messaging/registration-token-not-registered" ||
            error.message.includes("SenderId mismatch") ||
            error.code === "messaging/mismatched-credential"
          ) {
            console.log(`Removing invalid token for user ${user._id}`);
            await User.updateOne(
              { _id: user._id },
              { $unset: { fcmToken: "" } }
            );
          }
        }
      }
    }

  } catch (error: any) {
    console.error("Error in checkAndNotifyRequirements:", error);
  }
};

// ─── Helper: send FCM to a single user, clean up stale token on failure ───────
const sendFcmToUser = async (
  userId: string,
  notification: { title: string; body: string },
  data: Record<string, string>
) => {
  const user = await User.findById(userId).select("fcmToken");
  if (!user?.fcmToken) return;
  try {
    await fcm.send({ token: user.fcmToken, notification, data });
    console.log(`FCM sent to user ${userId}: ${notification.title}`);
  } catch (err: any) {
    console.error(`FCM Error (${notification.title}) for user ${userId}:`, err.message);
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.message?.includes("SenderId mismatch") ||
      err.code === "messaging/mismatched-credential"
    ) {
      await User.updateOne({ _id: userId }, { $unset: { fcmToken: "" } });
    }
  }
};

// ─── Helper: send FCM to all admins ──────────────────────────────────────────
const sendFcmToAdmins = async (
  notification: { title: string; body: string },
  data: Record<string, string>
) => {
  const admins = await User.find({ role: "admin", fcmToken: { $ne: null } }).select("_id fcmToken");
  for (const admin of admins) {
    if (!admin.fcmToken) continue;
    try {
      await fcm.send({ token: admin.fcmToken, notification, data });
    } catch (err: any) {
      console.error(`FCM Error (admin ${admin._id}):`, err.message);
      if (
        err.code === "messaging/registration-token-not-registered" ||
        err.message?.includes("SenderId mismatch") ||
        err.code === "messaging/mismatched-credential"
      ) {
        await User.updateOne({ _id: admin._id }, { $unset: { fcmToken: "" } });
      }
    }
  }
};

// ─── Stripe Notifications ─────────────────────────────────────────────────────

import Deal from "../models/Deal.model.js";

/**
 * /payment-intent — buyer initiated payment.
 * Notify: seller + all admins.
 */
export const notifyPaymentInitiated = async (dealId: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const data: Record<string, string> = { type: "PAYMENT_INITIATED", dealId };

    await sendFcmToUser(
      sellerId,
      {
        title: "💳 Payment Initiated",
        body: `Buyer has initiated payment of ₹${deal.agreedAmount} for Deal #${dealId}. Funds will be held in escrow.`,
      },
      data
    );

    await sendFcmToAdmins(
      {
        title: "💳 Payment Initiated",
        body: `Payment of ₹${deal.agreedAmount} initiated for Deal #${dealId}.`,
      },
      data
    );
  } catch (err: any) {
    console.error("notifyPaymentInitiated error:", err.message);
  }
};

/**
 * /buyer-confirm — buyer confirmed delivery, escrow released to seller.
 * Notify: seller + all admins.
 */
export const notifyEscrowReleased = async (dealId: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const data: Record<string, string> = { type: "ESCROW_RELEASED", dealId };

    await sendFcmToUser(
      sellerId,
      {
        title: "🎉 Payment Released!",
        body: `Buyer confirmed delivery. ₹${deal.agreedAmount} has been released to your Stripe account for Deal #${dealId}.`,
      },
      data
    );

    await sendFcmToAdmins(
      {
        title: "🎉 Escrow Released",
        body: `Buyer confirmed delivery for Deal #${dealId}. ₹${deal.agreedAmount} released to seller.`,
      },
      data
    );
  } catch (err: any) {
    console.error("notifyEscrowReleased error:", err.message);
  }
};

/**
 * /refund-escrow — escrow refunded (seller/admin triggered).
 * Notify: seller + buyer + all admins.
 */
export const notifyEscrowRefunded = async (dealId: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const buyerId = deal.buyerId.toString();
    const data: Record<string, string> = { type: "ESCROW_REFUNDED", dealId };

    await sendFcmToUser(
      buyerId,
      {
        title: "💰 Refund Processed",
        body: `Your escrow payment of ₹${deal.agreedAmount} for Deal #${dealId} has been refunded.`,
      },
      data
    );

    await sendFcmToUser(
      sellerId,
      {
        title: "🔄 Deal Refunded",
        body: `Escrow of ₹${deal.agreedAmount} for Deal #${dealId} has been refunded to the buyer.`,
      },
      data
    );

    await sendFcmToAdmins(
      {
        title: "🔄 Escrow Refunded",
        body: `Escrow refund processed for Deal #${dealId}. Amount: ₹${deal.agreedAmount}.`,
      },
      data
    );
  } catch (err: any) {
    console.error("notifyEscrowRefunded error:", err.message);
  }
};

/**
 * /dispute — dispute raised.
 * Notify: seller + buyer + all admins.
 */
export const notifyDisputeRaised = async (dealId: string, reason: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const buyerId = deal.buyerId.toString();
    const data: Record<string, string> = { type: "DISPUTE_RAISED", dealId };

    const notification = {
      title: "⚠️ Dispute Raised",
      body: `A dispute has been raised for Deal #${dealId}. Reason: ${reason}`,
    };

    await sendFcmToUser(sellerId, notification, data);
    await sendFcmToUser(buyerId, notification, data);
    await sendFcmToAdmins(notification, data);
  } catch (err: any) {
    console.error("notifyDisputeRaised error:", err.message);
  }
};

/**
 * /resolve-dispute — dispute resolved.
 * Notify: seller + buyer.
 */
export const notifyDisputeResolved = async (dealId: string, resolution: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const buyerId = deal.buyerId.toString();
    const data: Record<string, string> = { type: "DISPUTE_RESOLVED", dealId };

    const notification = {
      title: "✅ Dispute Resolved",
      body: `The dispute for Deal #${dealId} has been resolved. Resolution: ${resolution}`,
    };

    await sendFcmToUser(sellerId, notification, data);
    await sendFcmToUser(buyerId, notification, data);
  } catch (err: any) {
    console.error("notifyDisputeResolved error:", err.message);
  }
};

/**
 * /cancel — deal cancelled.
 * Notify: seller + buyer + admin.
 */
export const notifyDealCancelled = async (dealId: string) => {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    const sellerId = deal.sellerId.toString();
    const buyerId = deal.buyerId.toString();
    const data: Record<string, string> = { type: "DEAL_CANCELLED", dealId };

    const notification = {
      title: "❌ Deal Cancelled",
      body: `Deal #${dealId} has been cancelled.`,
    };

    await sendFcmToUser(sellerId, notification, data);
    await sendFcmToUser(buyerId, notification, data);
    await sendFcmToAdmins(notification, data);
  } catch (err: any) {
    console.error("notifyDealCancelled error:", err.message);
  }
};

/**
 * /advertisement (POST) — new advertisement created.
 * Notify: all admins.
 */
export const notifyAdminsNewAdvertisement = async (
  advertisementId: string,
  advertiserName: string
) => {
  try {
    const data: Record<string, string> = {
      type: "NEW_ADVERTISEMENT",
      advertisementId,
    };

    const notification = {
      title: "📢 New Advertisement Submitted",
      body: `A new advertisement has been submitted by ${advertiserName} (ID: ${advertisementId}).`,
    };

    await sendFcmToAdmins(notification, data);
  } catch (err: any) {
    console.error("notifyAdminsNewAdvertisement error:", err.message);
  }
};

/**
 * /advertisement/:advertisementId/status — ad status updated (Approved/Rejected/Disabled).
 * Notify: ad owner.
 */
export const notifyAdOwnerStatusUpdate = async (
  advertisementId: string,
  status: "APPROVED" | "REJECTED" | "DISABLED",
  rejectionReason?: string
) => {
  try {
    const ad = await Advertisement.findById(advertisementId);
    if (!ad) return;

    const data: Record<string, string> = {
      type: "ADVERTISEMENT_STATUS_UPDATE",
      advertisementId,
      status,
    };

    let title = "";
    let body = "";

    switch (status) {
      case "APPROVED":
        title = "✅ Advertisement Approved";
        body = `Your advertisement "${ad.title}" has been approved and is now live!`;
        break;
      case "REJECTED":
        title = "❌ Advertisement Rejected";
        body = `Your advertisement "${ad.title}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`;
        break;
      case "DISABLED":
        title = "⏸️ Advertisement Disabled";
        body = `Your advertisement "${ad.title}" has been disabled.`;
        break;
    }

    await sendFcmToUser(ad.advertiserId.toString(), { title, body }, data);
  } catch (err: any) {
    console.error("notifyAdOwnerStatusUpdate error:", err.message);
  }
};

/**
 * /kyc/:userId (PATCH) — KYC reviewed by admin.
 * Notify: the user.
 */
export const notifyUserKycStatus = async (
  userId: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) => {
  try {
    const data: Record<string, string> = {
      type: "KYC_STATUS_UPDATE",
      status,
    };

    let title = "";
    let body = "";

    if (status === "approved") {
      title = "✅ KYC Approved";
      body = "Your KYC has been successfully verified. You can now use all features of the app.";
    } else {
      title = "❌ KYC Rejected";
      body = `Your KYC was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : "Please check your documents and try again."}`;
    }

    await sendFcmToUser(userId, { title, body }, data);
  } catch (err: any) {
    console.error("notifyUserKycStatus error:", err.message);
  }
};

/**
 * System Logs — notifications for critical/error level system events.
 * Notify: all admins.
 */
export const notifyAdminsSystemLog = async (log: ISystemLog) => {
  try {
    // Only notify for high severity events to avoid spam
    if (!["CRITICAL", "ERROR", "WARNING"].includes(log.severity)) {
      return;
    }

    const data: Record<string, string> = {
      type: "SYSTEM_LOG",
      eventType: log.eventType,
      severity: log.severity,
      logId: log._id?.toString() || "",
    };

    const notification = {
      title: `⚠️ System ${log.severity}: ${log.eventType}`,
      body: log.message,
    };

    await sendFcmToAdmins(notification, data);
  } catch (err: any) {
    console.error("notifyAdminsSystemLog error:", err.message);
  }
};