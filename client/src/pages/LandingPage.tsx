import { Diamond, Shield, Users, ArrowRight, Gem, Scale, Lock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "@/components/layout/Navbar";
// import Navbar from "@/components/layout/Navbar";


const LandingPage = () => {

// const {user} = useSelector((state:any) =>state.auth);
// const navigate =  useNavigate();

  return (
    <div className="min-h-screen gradient-luxury">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        {/* <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Diamond className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gradient">Reyu Diamond</span>
          </Link>
          {!user &&<div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm">
                Create Account
              </Button>
            </Link>
          </div>}
          {user && <Button onClick={()=>navigate("/dashboard")} size="sm">DashBoard</Button>}
        </div> */}
        <Navbar/>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-fade-up">
              <h1 className="text-display mb-6 leading-tight">
                Trade Diamonds with
                <span className="text-gradient block ">Confidence & Clarity</span>
              </h1>
              <p className="text-body text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                A secure, transparent digital platform for professional diamond trading. 
                Buy and sell with verified traders in a trusted marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button variant="hero" size="xl">
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="heroOutline" size="xl">
                    Login
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start">
                <TrustBadge icon={Shield} text="Escrow Protected" />
                <TrustBadge icon={Users} text="KYC Verified" />
                <TrustBadge icon={Lock} text="Secure Transactions" />
              </div>
            </div>
            
            {/* Hero visual */}
            <div className="flex-1 relative">
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-diamond-teal/30 via-diamond-blue/30 to-diamond-violet/30 blur-3xl animate-pulse-soft" />
                <div className="relative card-elevated p-8 diamond-shine">
                  <Gem className="w-full h-full text-primary/80" strokeWidth={0.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-headline mb-4">Why Choose Reyu Diamond?</h2>
            <p className="text-body max-w-2xl mx-auto">
              Experience professional diamond trading with unmatched transparency and security
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard 
              icon={Users}
              title="Unified Trading"
              description="Buy and sell from a single account. No role switching, just seamless transactions."
            />
            <ValueCard 
              icon={Scale}
              title="Fair Pricing"
              description="Auction-based system ensures competitive, market-driven prices for every diamond."
            />
            <ValueCard 
              icon={Shield}
              title="Escrow Protection"
              description="Every payment is held securely until delivery is confirmed by both parties."
            />
            <ValueCard 
              icon={FileCheck}
              title="Full Transparency"
              description="Track every step of your deal with complete visibility and audit trails."
            />
            <ValueCard 
              icon={Lock}
              title="Verified Users"
              description="All traders undergo mandatory KYC verification for maximum trust."
            />
            <ValueCard 
              icon={Diamond}
              title="Professional Grade"
              description="Built for the diamond industry with features that professionals demand."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">How It Works</h2>
            <p className="text-body max-w-2xl mx-auto">
              From registration to completed deal in five simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            <StepCard number={1} title="Register" description="Create your account" />
            <StepCard number={2} title="Verify" description="Complete KYC process" />
            <StepCard number={3} title="List or Bid" description="Add inventory or browse" />
            <StepCard number={4} title="Deal" description="Accept and negotiate" />
            <StepCard number={5} title="Complete" description="Secure payment & delivery" />
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 px-6 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="card-elevated p-10 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-headline mb-4">Built on Trust & Security</h2>
            <p className="text-body mb-8 max-w-2xl mx-auto">
              Every aspect of Reyu Diamond is designed with security first. Mandatory identity verification, 
              escrow-protected payments, comprehensive audit trails, and professional dispute resolution 
              ensure your trades are safe and transparent.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <SecurityFeature text="Mandatory KYC" />
              <SecurityFeature text="Escrow Payments" />
              <SecurityFeature text="Audit Records" />
              <SecurityFeature text="Dispute Handling" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-headline mb-4">
            Trade with clarity. Trust every transaction.
          </h2>
          <p className="text-body mb-10 max-w-xl mx-auto">
            Join a community of verified diamond professionals on the most secure trading platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="xl">
                Create Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="heroOutline" size="xl">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card/80 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Diamond className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-gradient">Reyu Diamond</span>
            </div>
            <div className="text-caption">
              © 2024 Reyu Diamond. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-caption hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-caption hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-caption hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const TrustBadge = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="h-4 w-4 text-primary" />
    <span>{text}</span>
  </div>
);

const ValueCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="card-luxury p-6 hover:shadow-elevated transition-shadow duration-300">
    <Icon className="h-10 w-10 text-primary mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-caption">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="card-luxury p-6 text-center relative">
    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-4">
      {number}
    </div>
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-caption text-sm">{description}</p>
  </div>
);

const SecurityFeature = ({ text }: { text: string }) => (
  <div className="px-4 py-2 bg-muted rounded-full text-sm font-medium">
    {text}
  </div>
);

export default LandingPage;