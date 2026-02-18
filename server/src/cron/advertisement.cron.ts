
import cron from "node-cron";
import { Advertisement } from "../models/Advertisement.model.js";

export const checkExpiredAds = async () => {
    console.log("Running Advertisement Expiry Cron Job...");
    const now = new Date();

    try {
        // Find APPROVED advertisements that have ended
        const result = await Advertisement.updateMany(
            {
                status: "APPROVED",
                endDate: { $lte: now }
            },
            {
                $set: { status: "DISABLED" }
            }
        );

        if (result.matchedCount > 0) {
            console.log(`Found ${result.matchedCount} expired advertisements.`);
            console.log(`Disabled ${result.modifiedCount} expired advertisements.`);
        } else {
            console.log("No expired advertisements found.");
        }
    } catch (error) {
        console.error("Error in Advertisement Expiry Cron Job:", error);
    }
};

export const initAdvertisementCron = () => {
    // Run every hour
    cron.schedule("0 * * * * *", checkExpiredAds);

    console.log("Advertisement Expiry Cron Job initialized.");
};
