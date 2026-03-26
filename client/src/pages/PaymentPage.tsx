import { useParams, useNavigate } from "react-router-dom";
import { SecurePaymentHeader } from "@/components/payment/SecurePaymentHeader";
import { PaymentInitiationCard } from "@/components/payment/PaymentInitiationCard";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchDealByIdRequest } from "@/features/deal/dealSlice";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function PaymentPage() {
    const { dealId } = useParams();
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const { currentDeal: deal, isLoading } = useSelector((state: RootState) => state.deal);

    useEffect(() => {
        if (dealId) {
            dispatch(fetchDealByIdRequest(dealId));
        }
    }, [dispatch, dealId]);

    const handlePaymentInitiated = () => {
        // In real app, this would redirect to success or refresh status
        // For now, go to escrow dashboard
        navigate(`/escrow/${dealId}`);
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500 font-semibold tracking-wide">Loading secure invoice...</div>;
    if (!deal) return <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-xl m-4">Error: Transaction details not found.</div>;
    if (!stripePublicKey) return (
        <div className="p-10 text-center max-w-lg mx-auto mt-10 bg-rose-50 border border-rose-100 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-rose-900 mb-2">Configuration Missing</h2>
            <p className="text-rose-800/70 text-sm">The Stripe Public Key has not been configured in the environment. Please contact support or set <code>VITE_STRIPE_PUBLIC_KEY</code> in <code>.env</code>.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SecurePaymentHeader />

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl mb-6">
                    <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        &larr; Return to Deal
                    </button>
                </div>

                <Elements stripe={stripePromise}>
                    <PaymentInitiationCard
                        deal={deal}
                        onPaymentInitiated={handlePaymentInitiated}
                    />
                </Elements>
            </div>
        </div>
    );
}
