import { z } from "zod";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";


export const preferenceSchema = z.object({
    name: z.string().min(1, "Preference name is required"),
    shapes: z.array(z.nativeEnum(DiamondShape)).min(1, "Select at least one shape"),
    minCarat: z.coerce.number().min(0, "Min carat must be positive"),
    maxCarat: z.coerce.number().min(0, "Max carat must be positive"),
    colors: z.array(z.nativeEnum(DiamondColor)).min(1, "Select at least one color"),
    clarities: z.array(z.nativeEnum(DiamondClarity)).min(1, "Select at least one clarity"),
    certifications: z.array(z.nativeEnum(DiamondCertification)).min(1, "Select at least one certification"),
    minBudget: z.coerce.number().min(0, "Min budget must be positive"),
    maxBudget: z.coerce.number().min(0, "Max budget must be positive"),
}).refine((data) => data.minCarat <= data.maxCarat, {
    message: "Min carat cannot be greater than Max carat",
    path: ["minCarat"],
}).refine((data) => data.minBudget <= data.maxBudget, {
    message: "Min budget cannot be greater than Max budget",
    path: ["minBudget"],
});