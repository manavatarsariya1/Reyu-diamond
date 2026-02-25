import { z } from "zod";
import mongoose from "mongoose";

export const createAdvertisementSchema = z.object({
    body: z.object({
        title: z.string().min(3).max(100),
        description: z.string().optional(),
        inventoryId: z.string().optional().refine((val) => !val || mongoose.Types.ObjectId.isValid(val), "Invalid Inventory ID"),
        ctaLink: z.string().url().optional().or(z.literal("")),
        bannerSection: z.preprocess((val) => {
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch {
                    return [val];
                }
            }
            return val;
        }, z.array(z.string().transform(s => s.trim().replace(/^"|"$/g, ''))).optional().pipe(z.array(z.enum(["HOME_DASHBOARD", "MARKETPLACE", "BANNER_ZONES"])).optional())),
        // mediaUrl and mediaType are handled by file upload service but validated here if passed as body
        startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
        endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
    })
});

export const updateAdvertisementStatusSchema = z.object({
    params: z.object({
        advertisementId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Advertisement ID"),
    }),
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED", "DISABLED"]),
        rejectionReason: z.string().optional(),
    })
});

export const getAdvertisementsSchema = z.object({
    query: z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "DISABLED"]).optional(),
        section: z.enum(["HOME_DASHBOARD", "MARKETPLACE", "BANNER_ZONES"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        page: z.string().optional().transform(Number),
        limit: z.string().optional().transform(Number),
    })
});
