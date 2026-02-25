import { z } from "zod";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";


export const preferenceSchema = z.object({
    shape: z.nativeEnum(DiamondShape, { errorMap: () => ({ message: "Select a shape" }) }),
    carat: z.coerce.number().min(0.1, "Carat must be at least 0.1"),
    color: z.nativeEnum(DiamondColor, { errorMap: () => ({ message: "Select a color" }) }),
    clarity: z.nativeEnum(DiamondClarity, { errorMap: () => ({ message: "Select a clarity" }) }),
    lab: z.nativeEnum(DiamondCertification, { errorMap: () => ({ message: "Select a certification" }) }),
    location: z.string().min(1, "Location is required"),
    budget: z.coerce.number().min(100, "Budget must be at least $100"),
});