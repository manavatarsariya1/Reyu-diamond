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
    
    // Guard: Deal already paid
    if (deal.status !== "CREATED" && deal.status !== "PAYMENT_PENDING") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Secured</h2>
                    <p className="text-gray-500 mb-8">This transaction is already in escrow status. No further payment is required.</p>
                    <button 
                        onClick={() => navigate(`/deals/${dealId}`)}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Return to Deal Details
                    </button>
                </div>
            </div>
        );
    }
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
