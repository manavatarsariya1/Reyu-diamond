import type { Reputation } from "@/types/rating";
import { Star } from "lucide-react";

interface ReputationBreakdownProps {
    reputation: Reputation;
}

export function ReputationBreakdown({ reputation }: ReputationBreakdownProps) {
    const distribution = reputation.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = reputation.totalRatings || 1; // Avoid divide by zero

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Rating Breakdown</h4>
            <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((score) => {
                    const count = distribution[score as keyof typeof distribution] || 0;
                    const percentage = (count / total) * 100;

                    return (
                        <div key={score} className="flex items-center gap-3">
                            <div className="flex items-center w-8 gap-1 text-sm text-gray-600 font-medium">
                                <span>{score}</span>
                                <Star className="w-3 h-3 text-gray-300 fill-gray-300" />
                            </div>

                            <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${score >= 4 ? 'bg-amber-400' : 'bg-gray-300'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>

                            <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
