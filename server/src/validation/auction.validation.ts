import { z } from "zod";

export const createAuctionSchema = z.object({
    basePrice: z.number().min(0, "Base price must be positive"),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)),
    endDate: z.string().or(z.date()).transform((val) => new Date(val)),
}).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
});

export const updateAuctionSchema = z.object({
    basePrice: z.number().min(0).optional(),
    startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
    status: z.enum(["ACTIVE", "CLOSED", "CANCELLED"]).optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});
