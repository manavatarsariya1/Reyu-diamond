import cron from "node-cron";
import Deal from "../models/Deal.model.js";
import { Auction } from "../models/Auction.model.js";

export const checkPaymentWindow = async () => {
    console.log("Running Payment Window Check Cron Job...");
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    try {
        // Find deals that are unpaid and created more than 24 hours ago
        // We look for 'CREATED' or 'PAYMENT_PENDING' status
        const unpaidDeals = await Deal.find({
            status: { $in: ["CREATED", "PAYMENT_PENDING"] },
            createdAt: { $lte: twentyFourHoursAgo },
            "payment.isPaid": false
        });

        if (unpaidDeals.length === 0) return;

        console.log(`Found ${unpaidDeals.length} unpaid deals to process.`);

        for (const deal of unpaidDeals) {
            try {
                console.log(`Processing unpaid deal ${deal._id}`);

                // 1. Cancel the deal
                deal.status = "CANCELLED";
                // Add to history
                deal.history.push({
                    status: "CANCELLED",
                    changedBy: deal.sellerId,
                    changedAt: new Date()
                });

                await deal.save();
                console.log(`Deal ${deal._id} cancelled.`);

                // 2. Handle the Auction
                const auction = await Auction.findById(deal.auctionId);
                if (auction) {
                    // Check if existing auction end date is still in the future
                    if (auction.endDate > now) {
                        console.log(`Auction ${auction._id} still has time remaining. Reactivating...`);
                        auction.status = "ACTIVE";
                        await auction.save();
                    } else {
                        console.log(`Auction ${auction._id} end date passed. Keeping it CLOSED.`);
                        // Ensure it is closed if not already (it likely is if the deal was created from it)
                        if (auction.status !== "CLOSED") {
                            auction.status = "CLOSED";
                            await auction.save();
                        }
                    }
                }

            } catch (error) {
                console.error(`Error processing unpaid deal ${deal._id}:`, error);
            }
        }

    } catch (error) {
        console.error("Error in Payment Cron Job:", error);
    }
};

export const initPaymentCron = () => {
    // Run every 10 minutes
    cron.schedule("0 * * * * *", checkPaymentWindow);

    console.log("Payment Cron Job initialized.");
};
