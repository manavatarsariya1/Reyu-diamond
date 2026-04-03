import { z } from "zod";


export const kycSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .trim(),

  middleName: z
    .string()
    .max(50, "Middle name must not exceed 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters")
    .trim(),

  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }, "You must be at least 18 years old"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone number must be 10 digits starting with 6-9"),

  // Address
  residentialAddress: z
    .string()
    .min(1, "Residential address is required")
    .trim(),

  city: z
    .string()
    .min(1, "City is required")
    .trim(),

  state: z
    .string()
    .min(1, "State is required")
    .trim(),

  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),

  country: z
    .string()
    .default("IN")
    .optional(),

  // Documents
  aadhaarNumber: z
    .string()
    .regex(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits"),

  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
    .transform((val) => val.toUpperCase()),

  aadhaarImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Aadhaar image is required")
    .refine(
      (files) => files[0]?.size <= 5000000,
      "Image size must be less than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/jpg", "image/png"].includes(files[0]?.type),
      "Only JPG, JPEG, and PNG formats are allowed"
    ),

  panImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "PAN image is required")
    .refine(
      (files) => files[0]?.size <= 5000000,
      "Image size must be less than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/jpg", "image/png"].includes(files[0]?.type),
      "Only JPG, JPEG, and PNG formats are allowed"
    ),

  selfie: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Selfie is required")
    .refine(
      (files) => files[0]?.size <= 5000000,
      "Image size must be less than 5MB"
    ),
});