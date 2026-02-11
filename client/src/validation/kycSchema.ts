import { z } from "zod";


export const kycSchema = z.object({
  aadhaarNumber: z
    .string()
    .regex(/^[0-9]{12}$/, "Aadhaar must be 12 digits"),

  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),

  aadhaarImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Aadhaar image required"),

  panImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "PAN image required"),

  selfie: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Selfie required"),
});