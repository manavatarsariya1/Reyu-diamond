import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Diamond, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtpRequested, resendOtpRequested, registerRequested, clearOtpState, clearRegisterState } from "@/features/auth/auth.Slice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";

// Zod Schema
const otpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  otp: z
    .string()
    .min(4, "OTP must be at least 4 characters")
    .max(6, "OTP must be at most 6 characters")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpFormData = z.infer<typeof otpSchema>;

type LocationState = {
  userDetail: any;
  email?: string;
  user?: any;
};

const VerifyOtp = () => {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const didRun = useRef(false);

  const { register: registerState, otp, resendOtp } = useSelector(
    (state: any) => state.auth
  );

  const [countdown, setCountdown] = useState(0);

  // Recover data safely

  const pendingRegister =
    state?.userDetail ||
    JSON.parse(sessionStorage.getItem("pending_register") || "null");

  const email =
    pendingRegister?.email || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: email, otp: "" },
  });

  // Guarded registration (runs once)
  useEffect(() => {

    if (sessionStorage.getItem("didRun")) return;
    sessionStorage.setItem("didRun", "true"); // mark as run

    if (!email) {
      navigate("/register");
      return;
    }

    setValue("email", email);
    sessionStorage.setItem("otp_email", email);

    if (pendingRegister && registerState.status === "idle") {
      dispatch(registerRequested(pendingRegister));
      sessionStorage.setItem(
        "pending_register",
        JSON.stringify(pendingRegister)
      );
    }
  }, [email]);

  // Navigate after OTP success
  useEffect(() => {
    if (otp.status === "success") {
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("pending_register");
      navigate("/kyc");
    }
  }, [otp.status]);


  useEffect(() => {
    if (registerState.status === "success" && registerState.message) {
      toast.success(registerState.message);
      dispatch(clearRegisterState());
    }

    if (registerState.status === "error" && registerState.error) {
      toast.error(registerState.error);
      navigate("/register");
      dispatch(clearRegisterState());
    }
  }, [registerState.status]);

  useEffect(() => {
    if (otp.status === "success" && otp.message) {
      toast.success(otp.message);
      dispatch(clearOtpState());
    }

    if (otp.status === "error" && otp.error) {
      toast.error(otp.error);
      dispatch(clearOtpState());
    }
  }, [otp.status]);


  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = (data: OtpFormData) => {
    dispatch(verifyOtpRequested(data));
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !email) return;
    dispatch(resendOtpRequested({ email }));
    setCountdown(60);
  };

  const otpLoading = otp.status === "loading";
  const resendLoading = resendOtp.status === "loading";

  return (
    <div className="min-h-screen gradient-luxury flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Diamond className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-gradient">Reyu Diamond</span>
        </Link>

        {/* Verify Card */}
        <div className="card-elevated p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a verification code to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {otp.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{otp?.error}</p>
            </div>
          )}

          {/* Success Message for Resend */}
          {resendOtp.status === "success" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">OTP has been resent to your email</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  readOnly
                  className="pl-10 bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                {...register("otp")}
                placeholder="Enter 4-6 digit code"
                maxLength={6}
                className={`text-center text-lg tracking-widest ${errors.otp ? "border-destructive" : ""
                  }`}
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resendLoading}
                className={`text-sm ${countdown > 0 || resendLoading
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-primary hover:underline cursor-pointer"
                  }`}
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend code in ${countdown}s`
                    : "Didn't receive the code? Resend"}
              </button>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={otp.status === "loading"}
            >
              {otp.status === "loading" ? "Verifying..." : "Verify Email"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-muted-foreground">
              Wrong email?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;