import { z } from "zod";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password Regex
 * Minimum 8 chars
 * At least one uppercase letter, one lowercase letter, one number and one special character:
*/
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
  username: z.string().min(2, "Username is required").max(50, "Username too long"),
  email: z.string().regex(emailRegex, "Invalid email format"),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be 8+ chars, include uppercase, lowercase, number & special char"
    ),
  fcmToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
  fcmToken: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().regex(emailRegex, "Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  fcmToken: z.string().nullable().optional(),
});
