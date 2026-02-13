import { z } from "zod";

export const submitKycSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    dob: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    address: z.object({
        residentialAddress: z.string().min(1, "Residential address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
        country: z.string().min(1, "Country is required"),
    }),
    documents: z.object({
        aadhaar: z.object({
            aadhaarNumber: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
        }),
        pan: z.object({
            panNumber: z.string().min(10, "Invalid PAN number"),
        }),
    }),
});
