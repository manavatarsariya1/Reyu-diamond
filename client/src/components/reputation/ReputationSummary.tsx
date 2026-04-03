import { ReputationBadge } from "./ReputationBadge";
import { StarRating } from "./StarRating";
import type { Reputation } from "@/types/rating";

interface ReputationSummaryProps {
    reputation: Reputation;
}

export function ReputationSummary({ reputation }: ReputationSummaryProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Left: Score & Badge */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-gray-900 leading-none">{reputation.averageScore.toFixed(1)}</span>
                    <div className="mt-2">
                        <StarRating rating={reputation.averageScore} size="sm" />
                    </div>
                </div>

                <div className="h-12 w-px bg-gray-100 hidden md:block"></div>

                <div className="flex flex-col gap-1">
                    <ReputationBadge tier={reputation.badgeTier} />
                    <p className="text-xs text-gray-500 mt-1">{reputation.totalRatings} Verified Reviews</p>
                </div>
            </div>

            {/* Right: Deal Stats */}
            <div className="flex gap-8 text-center md:text-right">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{reputation.totalDeals}</p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Deals Completed</p>
                </div>
            </div>
        </div>
    );
}
