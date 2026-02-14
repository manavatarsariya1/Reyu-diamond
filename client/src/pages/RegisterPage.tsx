import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Diamond, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { registerRequested, verifyOtpRequested, resendOtpRequested, clearOtpState, clearRegisterState } from "@/features/auth/auth.Slice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";

// Zod Schemas
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name cannot be more than 50 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .trim()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(4, "OTP must be at least 4 characters")
    .max(6, "OTP must be at most 6 characters")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { register: registerState, otp, resendOtp } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Registration Form
  const {
    register,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // OTP Form
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Handle registration success
  useEffect(() => {
    if (registerState.status === "success" && registerState.message) {
      toast.success(registerState.message);
      setRegistrationComplete(true);
      setRegisteredEmail(getValues("email"));
      dispatch(clearRegisterState());
    }

    if (registerState.status === "error" && registerState.error) {
      toast.error(registerState.error);
      dispatch(clearRegisterState());
    }
  }, [registerState.status]);

  // Handle OTP verification success
  useEffect(() => {
    if (otp.status === "success" && otp.message) {
      toast.success(otp.message);
      dispatch(clearOtpState());
      navigate("/login");
    }

    if (otp.status === "error" && otp.error) {
      toast.error(otp.error);
      dispatch(clearOtpState());
    }
  }, [otp.status]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onRegisterSubmit = (data: RegisterFormData) => {
    const registerData = {
      username: data.username,
      email: data.email,
      password: data.password,
    };
    dispatch(registerRequested(registerData));
  };

  const onOtpSubmit = (data: OtpFormData) => {
    dispatch(verifyOtpRequested({ email: registeredEmail, otp: data.otp }));
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !registeredEmail) return;
    dispatch(resendOtpRequested({ email: registeredEmail }));
    setCountdown(60);
    resetOtp();
  };

  return (
    <div className="min-h-screen gradient-luxury flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Diamond className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-gradient">Reyu Diamond</span>
        </Link>

        {/* Register Card */}
        <div className="card-elevated p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">
              {registrationComplete 
                ? "Verify your email to continue" 
                : "Join the professional diamond trading platform"}
            </p>
          </div>

          {/* KYC Notice */}
          {!registrationComplete && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">KYC Verification Required</p>
                <p className="text-muted-foreground">Identity verification is mandatory to access trading features.</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className={registrationComplete ? "text-muted-foreground" : ""}>
                Name
              </Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${registrationComplete ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="John Doe"
                  disabled={registrationComplete}
                  className={`pl-10 ${registerErrors.username ? "border-destructive" : ""} ${registrationComplete ? "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60" : ""}`}
                />
              </div>
              {registerErrors.username && !registrationComplete && (
                <p className="text-sm text-destructive">{registerErrors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className={registrationComplete ? "text-muted-foreground" : ""}>
                Email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${registrationComplete ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  disabled={registrationComplete}
                  className={`pl-10 ${registerErrors.email ? "border-destructive" : ""} ${registrationComplete ? "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60" : ""}`}
                />
              </div>
              {registerErrors.email && !registrationComplete && (
                <p className="text-sm text-destructive">{registerErrors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className={registrationComplete ? "text-muted-foreground" : ""}>
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${registrationComplete ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  disabled={registrationComplete}
                  className={`pl-10 pr-10 ${registerErrors.password ? "border-destructive" : ""} ${registrationComplete ? "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60" : ""}`}
                />
                {!registrationComplete && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {registerErrors.password && !registrationComplete && (
                <p className="text-sm text-destructive">{registerErrors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={registrationComplete ? "text-muted-foreground" : ""}>
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${registrationComplete ? "text-muted-foreground/50" : "text-muted-foreground"}`} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  disabled={registrationComplete}
                  className={`pl-10 pr-10 ${registerErrors.confirmPassword ? "border-destructive" : ""} ${registrationComplete ? "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60" : ""}`}
                />
                {!registrationComplete && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {registerErrors.confirmPassword && !registrationComplete && (
                <p className="text-sm text-destructive">{registerErrors.confirmPassword.message}</p>
              )}
            </div>

            {!registrationComplete && (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={registerState.status === "loading"}
              >
                {registerState.status === "loading" ? "Creating Account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </form>

          {/* OTP Verification Section */}
          {registrationComplete && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Verification Code Sent</p>
                  <p className="text-muted-foreground">
                    We've sent a verification code to <span className="font-medium text-foreground">{registeredEmail}</span>
                  </p>
                </div>
              </div>

              {/* Success Message for Resend */}
              {resendOtp.status === "success" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600">OTP has been resent to your email</p>
                </div>
              )}

              {/* OTP Error Message */}
              {otp.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{otp.error}</p>
                </div>
              )}

              <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-5">
                {/* OTP Field */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    {...registerOtp("otp")}
                    placeholder="Enter 4-6 digit code"
                    maxLength={6}
                    className={`text-center text-lg tracking-widest ${otpErrors.otp ? "border-destructive" : ""}`}
                    autoFocus
                  />
                  {otpErrors.otp && (
                    <p className="text-sm text-destructive">{otpErrors.otp.message}</p>
                  )}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resendOtp.status === "loading"}
                    className={`text-sm ${
                      countdown > 0 || resendOtp.status === "loading"
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-primary hover:underline cursor-pointer"
                    }`}
                  >
                    {resendOtp.status === "loading"
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
            </div>
          )}

          {!registrationComplete && (
            <div className="mt-5 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;