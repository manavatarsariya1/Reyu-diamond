import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Diamond, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { resendOtpRequested, clearResendOtpState, clearOtpState, verifyOtpRequested } from "@/features/auth/auth.Slice";
import { toast } from "react-toastify";

type LocationState = {
  email?: string;
  message?: string;
};

const Verify = () => {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { resendOtp, otp, user } = useSelector((state: any) => state.auth);
  const [countdown, setCountdown] = useState(0);
  const [verificationcode, setVerificationcode] = useState("");

  // Get email from state or sessionStorage
  const email = state?.email || sessionStorage.getItem("otp_email") || "";
  const errorMessage = state?.message || "Please verify your email first";

  useEffect(() => {
    // If no email is found, redirect to register
    if (!email && !user) {
      navigate("/register");
    }
  }, [email, navigate, user]);

  // Handle resend OTP success
  useEffect(() => {
    if (otp.status === "success" && user) {
      toast.success(otp.message || "OTP verified successfully");
      dispatch(clearOtpState());
      
      if (user.role === "admin") {
        navigate("/admin");
      } else if (!user.isKycVerified) {
        navigate("/kyc");
      } else {
        navigate("/dashboard");
      }
    }
    
    if (otp.status === "error") {
      toast.error(
        otp.error?.details ||
        otp.error?.message ||
        "Failed to verify OTP"
      );
      dispatch(clearOtpState());
      
      // return;
      // navigate("/verify-otp", { state: { email } });
    }

    if (resendOtp.status === "error" && resendOtp.error.message) {
      toast.error(resendOtp.error.message || "Failed to resend OTP");
      dispatch(clearOtpState());
    }

  }, [otp.status, resendOtp.status, dispatch, navigate, email]);


  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOtp = () => {
    if (countdown > 0 || !email) return;
    dispatch(resendOtpRequested({ email }));
    setCountdown(60);
  };

  const handleGoToVerify = (e: React.FormEvent) => {
  e.preventDefault();
  dispatch(verifyOtpRequested({ email, otp: verificationcode })); // OTP will be entered on the next page
  // dispatch(clearResendOtpState());
  // navigate("/verify-otp", { state: { email } });
};



const resendLoading = resendOtp.status === "loading";

return (
  <div className="min-h-screen gradient-luxury flex items-center justify-center p-6 py-12">
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link to="/" className="flex items-center justify-center gap-2 mb-8">
        <Diamond className="h-10 w-10 text-primary" />
        <span className="text-2xl font-bold text-gradient">Reyu Diamond</span>
      </Link>

      {/* Verification Reminder Card */}
      <div className="card-elevated p-8">
        {/* Icon and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verification Required</h1>
          <p className="text-muted-foreground">
            Your email address needs to be verified before you can continue
          </p>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">
              Verification Pending
            </p>
            <p className="text-sm text-amber-700">{errorMessage}</p>
          </div>
        </div>

        {/* Success Message for Resend */}
        {resendOtp.status === "success" && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">
              A new verification code has been sent to your email
            </p>
          </div>
        )}

        {/* Email Display */}
        <form action="" onSubmit={handleGoToVerify}>
          <div className="space-y-2 mb-6">
            <Label htmlFor="email" className="text-sm font-medium">
              Your Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="pl-10 bg-muted/50 cursor-not-allowed font-medium"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                // {...registerOtp("otp")}
                placeholder="Enter 4-6 digit code"
                maxLength={6}
                className={`text-center text-lg tracking-widest `}
                autoFocus
                value={verificationcode}
                required
                onChange={(e) => setVerificationcode(() => e.target.value)}
              />
              <Button
                type="button"
                variant="link"
                size="lg"
                className="w-full text-blue-700"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resendLoading}
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend Code (${countdown}s)`
                    : "Resend Verification Code"}
              </Button>

            </div>

            <div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full "
              // onClick={handleResendOtp}
              // onClick={handleGoToVerify}

              >
                Verify OTP

              </Button>
            </div>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Can't find the email?</strong>
            <br />
            Check your spam folder or click the resend button above
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Create a new account
            </Link>
          </p>
          {/* <p className="text-sm text-muted-foreground">
              Already verified?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in here
              </Link>
            </p> */}
        </div>
      </div>
    </div>
  </div>
);
};

export default Verify;