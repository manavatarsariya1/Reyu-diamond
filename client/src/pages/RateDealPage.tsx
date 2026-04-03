import { useParams, useNavigate } from "react-router-dom";
import { RatingSubmissionCard } from "@/components/reputation/RatingSubmissionCard";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchDealByIdRequest } from "@/features/deal/dealSlice";

export default function RateDealPage() {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentDeal: deal, isLoading } = useSelector((state: RootState) => state.deal);

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (dealId) {
            dispatch(fetchDealByIdRequest(dealId));
        }
    }, [dispatch, dealId]);

    const handleRatingSubmit = (score: number, comment: string) => {
        // TODO: Map to actual reputation API submission in backend
        console.log(`Submitted rating: ${score}, Comment: ${comment}`);
        setSubmitted(true);
        // Navigate back after delay
        setTimeout(() => {
            navigate("/deals/" + dealId);
        }, 2000);
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading deal framework...</div>;
    if (!deal) return <div className="p-10 text-center text-red-500">Error: Deal trace not found.</div>;


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
