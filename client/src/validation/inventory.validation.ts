import { z } from "zod";

const inventoryStatusEnum = ["AVAILABLE", "NOT_AVAILABLE", "LISTED", "SOLD", "ON_MEMO", "LOCKED", "AUCTION_ENDED"] as const;
const cutEnum = ["EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "POOR"] as const;
const colorEnum = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] as const;
const clarityEnum = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] as const;
const shapeEnum = ["ROUND", "PRINCESS", "CUSHION", "EMERALD", "OVAL", "RADIANT", "ASSCHER", "MARQUISE", "HEART", "PEAR"] as const;

export const createInventorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),

    carat: z.coerce.number().min(0.01, "Carat must be at least 0.01"),

    cut: z.enum(cutEnum, {
        message: "Invalid cut value",
    }),
    color: z.enum(colorEnum, {
        message: "Invalid color value",
    }),
    clarity: z.enum(clarityEnum, {
        message: "Invalid clarity value",
    }),
    shape: z.enum(shapeEnum, {
        message: "Invalid shape value",
    }),

    lab: z.string().min(1, "Lab is required"),
    location: z.string().min(1, "Location is required"),

    price: z.coerce.number().min(0, "Price must be positive"),
    currency: z.string().default("USD"),

    status: z.enum(inventoryStatusEnum).optional(),
});

export const updateInventorySchema = createInventorySchema.partial();
