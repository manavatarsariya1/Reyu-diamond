import { z } from "zod";

export const createRequirementSchema = z.object({
    shape: z.string().min(1, "Shape is required"),
    carat: z.number().min(0, "Carat must be a positive number"),
    color: z.string().min(1, "Color is required"),
    clarity: z.string().min(1, "Clarity is required"),
    lab: z.string().min(1, "Lab is required"),
    location: z.string().min(1, "Location is required"),
    budget: z.number().min(0, "Budget must be a positive number"),
});

export const updateRequirementSchema = createRequirementSchema.partial();
