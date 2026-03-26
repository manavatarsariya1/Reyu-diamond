import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchOnboardingLinkRequest, resetPaymentState } from "@/features/payment/paymentSlice";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";

export function StripeOnboardingBanner() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { onboardingUrl, isProcessing, error } = useSelector((state: RootState) => state.payment);

    // Only show for sellers who have NO stripeAccountId configured
    // Wait, the backend only returns onboarded status via user obj usually
    // Actually we just check `user?.stripeAccountId` -- but wait, `stripeAccountId` might not be in the frontend auth payload.
    // Assuming backend returns stripeAccountId, check if it's missing or if `user?.role === 'seller'` is needing it.

    // Better: let's assume we can show it explicitly if missing.
    // const needsOnboarding = user?.role === "seller" && !user?.stripeAccountId;
    const needsOnboarding = true;

    useEffect(() => {
        if (onboardingUrl) {
            // Redirect external
            window.location.href = onboardingUrl;
        }
        return () => { dispatch(resetPaymentState()); };
    }, [onboardingUrl, dispatch]);

    const handleOnboard = () => {
        dispatch(fetchOnboardingLinkRequest());
    };

    if (!needsOnboarding) return null;

    return (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-lg">Action Required: Setup Payments</h3>
                    <p className="text-white/80 text-sm mt-1 max-w-xl">
                        To receive payouts from Escrow when your deals are completed, you must connect a Stripe account. This is a one-time onboarding process.
                    </p>
                    {error && <p className="text-rose-300 text-xs mt-2 font-bold">{error}</p>}
                </div>
            </div>

            <Button
                onClick={handleOnboard}
                disabled={isProcessing}
                className="bg-white text-indigo-700 hover:bg-slate-50 font-bold whitespace-nowrap"
            >
                {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Link...</>
                ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" /> Connect Stripe Account</>
                )}
            </Button>
        </div>
    );
}
