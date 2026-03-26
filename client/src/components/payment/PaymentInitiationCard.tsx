import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Deal } from "@/types/deal";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { initiatePaymentRequest, resetPaymentState } from "@/features/payment/paymentSlice";

interface PaymentInitiationCardProps {
    deal: Deal;
    onPaymentInitiated: () => void;
}

export function PaymentInitiationCard({ deal, onPaymentInitiated }: PaymentInitiationCardProps) {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch<AppDispatch>();
    const { clientSecret, isProcessing: initProcessing, error } = useSelector((state: RootState) => state.payment);

    const [timeLeft, setTimeLeft] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock deadline: 24h from deal creation
    // In real app, use deal.paymentDeadline

    useEffect(() => {
        const deadline = new Date(new Date(deal.createdAt).getTime() + 24 * 60 * 60 * 1000);
        const timer = setInterval(() => {
            const now = new Date();
            const difference = deadline.getTime() - now.getTime();

            if (difference <= 0) {
                setTimeLeft("Expired");
                clearInterval(timer);
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                setTimeLeft(`${hours}h ${minutes}m remaining`);
            }
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [deal.createdAt]);

    // Cleanup store on unmount
    useEffect(() => {
        return () => { dispatch(resetPaymentState()); };
    }, [dispatch]);

    // Auto-initiate if not already done
    useEffect(() => {
        if (!clientSecret && !initProcessing && timeLeft !== "Expired" && deal._id) {
            handleInitiate();
        }
    }, [clientSecret, initProcessing, timeLeft, deal._id]);

    const handleInitiate = () => {
        dispatch(initiatePaymentRequest(deal._id as string));
    };

    const handleConfirmPayment = async () => {
        if (!stripe || !elements || !clientSecret) {
            toast.error("Stripe has not loaded yet.");
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        setIsSubmitting(true);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    // Could add user details here if needed
                },
            },
        });

        setIsSubmitting(false);

        if (stripeError) {
            toast.error(stripeError.message || "Payment failed");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            toast.success("Payment successful. Funds are now in Escrow.");
            onPaymentInitiated();
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 ">Invoice #{deal._id?.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-500 mt-1">Payable to Escrow Account</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-slate-900">${deal.agreedAmount?.toLocaleString()}</p>
                </div>
            </div>

            {/* Escrow Explanation */}
            <div className="p-6 bg-blue-50/30 border-b border-blue-50">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full shrink-0">
                        <ShieldCheck className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900 text-sm">Escrow Protection Active</h3>
                        <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                            Your payment is held securely in a neutral escrow account. Use the payment button below to fund the transaction. The seller will not receive funds until you confirm delivery and inspect the diamond.
                        </p>
                    </div>
                </div>
            </div>

            {/* Countdown & Action */}
            <div className="p-8">
                <div className="flex items-center justify-between mb-8 bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-800">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">Payment Window</span>
                    </div>
                    <span className="font-mono font-bold text-lg">{timeLeft || "Calculating..."}</span>
                </div>

                {error && <p className="text-rose-500 font-bold mb-4 text-center">{error}</p>}

                {!clientSecret ? (
                    <Button
                        size="lg"
                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg shadow-xl shadow-slate-200 transition-all hover:translate-y-[-1px]"
                        onClick={handleInitiate}
                        disabled={initProcessing || timeLeft === "Expired"}
                    >
                        {initProcessing ? (
                            <span className="flex items-center gap-2">Generating Secure Invoice...</span>
                        ) : (
                            <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Proceed to Secure Payment</span>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-inner">
                            <CardElement options={{
                                style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#9e2146' } }
                            }} />
                        </div>
                        <Button
                            size="lg"
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg shadow-xl"
                            onClick={handleConfirmPayment}
                            disabled={!stripe || isSubmitting}
                        >
                            {isSubmitting ? "Processing Payment..." : `Pay $${deal.agreedAmount?.toLocaleString()}`}
                        </Button>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>By clicking, you agree to the Escrow Terms of Service.</span>
                </div>
            </div>
        </div>
    );
}
