import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { toast } from "sonner";
import { CheckCircle, Lock } from "lucide-react";
import type { Deal } from "@/types/deal.ts";

interface RatingSubmissionCardProps {
    deal: Deal;
    onSubmit: (rating: number, comment: string) => void;
    isSubmitted?: boolean;
}

export function RatingSubmissionCard({ deal, onSubmit, isSubmitted = false }: RatingSubmissionCardProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hovered, setHovered] = useState(false);

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        onSubmit(rating, comment);
    };

    if (isSubmitted) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rating Submitted</h3>
                <p className="text-gray-500">Thank you for verifying this transaction. Your feedback helps build trust in the marketplace.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden max-w-md mx-auto">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white text-center">
                <h3 className="text-lg font-semibold mb-1">Rate Transaction</h3>
                <p className="text-slate-400 text-sm">How was your experience with this deal?</p>
            </div>

            <div className="p-8 flex flex-col items-center">
                {/* Visual Context */}
                <div className="mb-6 text-center">
                    <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Deal ID: {deal._id?.slice(0, 8)}</p>
                    <div className="flex justify-center mb-4">
                        <StarRating
                            rating={rating}
                            interactive={true}
                            size="lg"
                            onChange={setRating}
                        />
                    </div>
                    <p className={`text-sm font-medium transition-opacity duration-200 ${rating > 0 ? "text-amber-600 opacity-100" : "text-transparent opacity-0"}`}>
                        {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                    </p>
                </div>

                <div className="w-full space-y-4">
                    <Textarea
                        placeholder="Share your experience (optional)..."
                        className="resize-none min-h-[100px] border-gray-200 focus:border-amber-400 focus:ring-amber-100"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                    />
                    <div className="text-xs text-right text-gray-400">
                        {comment.length}/500
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-base font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                    >
                        Submit Rating
                    </Button>

                    <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1.5 mt-2">
                        <Lock className="w-3 h-3" />
                        Ratings are permanent and linked to this verified deal.
                    </p>
                </div>
            </div>
        </div>
    );
}
