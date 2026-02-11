import { useParams, useNavigate } from "react-router-dom";
import { SecurePaymentHeader } from "@/components/payment/SecurePaymentHeader";
import { PaymentInitiationCard } from "@/components/payment/PaymentInitiationCard";
import { useState, useEffect } from "react";
// Mock Deal Type imports
import type { Deal } from "@/types/deal.ts";
import { DealStatus } from "@/types/deal.ts";
import { PaymentStatus } from "@/types/payment";

const MOCK_DEAL: Deal = {
    id: "deal-123",
    status: DealStatus.PAYMENT_PENDING,
    listing: {
        id: "l1",
        sellerId: "seller-1",
        name: "1.5ct Round Brilliant Diamond",
        price: 12500,
        specifications: { shape: "Round", carat: 1.5, color: "D", clarity: "VVS1" },
        images: ["/placeholder.jpg"]
    } as any,
    buyerId: "buyer-1",
    sellerId: "seller-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // ...
} as any;

export default function PaymentPage() {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState<Deal | null>(null);

    useEffect(() => {
        if (dealId) setDeal(MOCK_DEAL);
    }, [dealId]);

    const handlePaymentInitiated = () => {
        // In real app, this would redirect to success or refresh status
        // For now, go to escrow dashboard
        navigate(`/escrow/${dealId}`);
    };

    if (!deal) return <div className="p-10 text-center">Loading secure invoice...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SecurePaymentHeader />

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl mb-6">
                    <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        &larr; Return to Deal
                    </button>
                </div>

                <PaymentInitiationCard
                    deal={deal}
                    onPaymentInitiated={handlePaymentInitiated}
                />
            </div>
        </div>
    );
}
