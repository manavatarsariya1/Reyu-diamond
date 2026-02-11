import { useParams, useNavigate } from "react-router-dom";
import { RatingSubmissionCard } from "@/components/reputation/RatingSubmissionCard";
import { useState, useEffect } from "react";
// Mock Deal Type imports - ensuring no unused vars if I mock locally for now
import { DealStatus, type Deal } from "@/types/deal.ts";

// Mock Data
const MOCK_DEAL: Deal = {
    id: "deal-123",
    status: DealStatus.COMPLETED,
    listing: {
        id: "l1",
        sellerId: "seller-1",
        price: 5000,
        specifications: { shape: "Round", carat: 1.0, color: "D", clarity: "VVS1" } // Simplified mock
    } as any, // casting for simplicity in mock
    buyerId: "buyer-1",
    sellerId: "seller-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // ... other required fields would be here
} as any;

export default function RateDealPage() {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // const deal = dealId
    //     ? ({ ...MOCK_DEAL, id: dealId } as Deal)
    //     : null;
    
    useEffect(() => {
        // Mock fetch deal
        if (dealId) {
            setDeal({ ...MOCK_DEAL, id: dealId } as Deal);
        }
    }, [dealId]);

    const handleRatingSubmit = (score: number, comment: string) => {
        console.log(`Submitted rating: ${score}, Comment: ${comment}`);
        setSubmitted(true);
        // Navigate back after delay
        setTimeout(() => {
            navigate("/deals/" + dealId);
        }, 2000);
    };

    if (!deal) return <div className="p-10 text-center">Loading deal...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-6">
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    &larr; Back to Deal
                </button>
            </div>
            <RatingSubmissionCard
                deal={deal}
                onSubmit={handleRatingSubmit}
                isSubmitted={submitted}
            />
        </div>
    );
}
