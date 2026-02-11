import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Diamond, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { registerRequested } from "@/features/auth/auth.Slice";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    // lastName: "",
    // company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { user, error, loading } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration - would connect to backend
    const registerData = {
      email: formData.email,
      name: formData.name,
      password: formData.password
    }

    // dispatch(registerRequested(registerData))
    console.log("Registration attempt:", formData);

    if (loading === false && !error) {
      // navigate("/")
      sessionStorage.setItem("otp_email", formData.email);
      navigate("/verify-otp", {
          state: {
              email: formData.email,
              user: registerData
          }
      });
    }
  };

  return (
    <div className="min-h-screen gradient-luxury flex items-center justify-center p-6 py-12">
      {/* <form action=""> */}

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
            <p className="text-muted-foreground">Join the professional diamond trading platform</p>
          </div>

          {/* KYC Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">KYC Verification Required</p>
              <p className="text-muted-foreground">Identity verification is mandatory to access trading features.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* <div className="grid "> */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
            {/* <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div> */}
            {/* </div> */}

            {/* <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    name="company"
                    placeholder="Diamond Trading Co."
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div> */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" variant={"outline"} className="w-full cursor-pointer">Submit</Button>
          </form>


          <div className=" mt-5 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full">
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

      {/* <p className="text-xs text-muted-foreground text-center mt-6">
        By creating an account, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">Terms of Service</a>
        {" "}and{" "}
        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
      </p> */}
      {/* </form> */}

      {/* Back to home */}
      {/* <div className="text-center mt-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </div> */}
    </div>
  );
};

export default RegisterPage;