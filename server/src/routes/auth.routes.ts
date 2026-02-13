import { Router } from "express";
import protect from "../middlewares/auth.middleware.js";
import { register, login, logout, verifyOtp, getProfile, upadteUserProfile, resendOtp, forgetPassword, resetPassword } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema, verifyOtpSchema, resendOtpSchema, forgetPasswordSchema, resetPasswordSchema, updateProfileSchema } from "../validation/auth.validation.js";
import { validate } from "../middlewares/validation.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate(updateProfileSchema), upadteUserProfile);

export default router;