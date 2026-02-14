import cron from "node-cron";
import { Auction } from "../models/Auction.model.js";
import Bid from "../models/Bid.model.js";
import { createSystemDealService } from "../services/deal.service.js";

export const initAuctionCron = () => {
    cron.schedule("0 * * * * *", async () => {
        console.log("Running Auction Auto-Close Cron Job...");
        const now = new Date();

        try {
            // Find ACTIVE auctions that have ended
            const expiredAuctions = await Auction.find({
                status: "ACTIVE",
                endDate: { $lte: now }
            });

            if (expiredAuctions.length === 0) return;

            console.log(`Found ${expiredAuctions.length} expired auctions.`);

            for (const auction of expiredAuctions) {
                // Find highest bid
                const highestBid = await Bid.findOne({
                    auctionId: auction._id,
                    isHighestBid: true
                });

                if (highestBid) {
                    try {
                        console.log(`Processing auction ${auction._id} with highest bid ${highestBid._id}`);

                        // Create Deal
                        await createSystemDealService(highestBid._id.toString());

                        // Mark Bid as ACCEPTED
                        highestBid.status = "ACCEPTED";
                        await highestBid.save();

                        // Close Auction
                        auction.status = "CLOSED";
                        auction.highestBidId = highestBid._id;
                        auction.highestBidderId = highestBid.buyerId;
                        await auction.save();

                        console.log(`Auction ${auction._id} closed and deal created.`);

                    } catch (error) {
                        console.error(`Error processing auction ${auction._id}:`, error);
                    }
                } else {
                    // No bids, just close the auction
                    console.log(`Closing auction ${auction._id} with no bids.`);
                    auction.status = "CLOSED";
                    await auction.save();
                }
            }
        } catch (error) {
            console.error("Error in Auction Cron Job:", error);
        }
    });

    console.log("Auction Cron Job initialized.");
};
