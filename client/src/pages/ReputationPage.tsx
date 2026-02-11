import { useParams } from "react-router-dom";
import { ReputationSummary } from "@/components/reputation/ReputationSummary";
import { ReputationBreakdown } from "@/components/reputation/ReputationBreakdown";
import type { Reputation } from "@/types/rating";
import { BadgeTier } from "@/types/rating";
import { User, ShieldCheck } from "lucide-react";

// Mock Data
const MOCK_REPUTATION: Reputation = {
    userId: "u123",
    averageScore: 4.8,
    totalDeals: 156,
    totalRatings: 142,
    badgeTier: BadgeTier.PLATINUM,
    distribution: {
        1: 0,
        2: 2,
        3: 5,
        4: 20,
        5: 115
    }
};

export default function ReputationPage() {
    const { userId } = useParams();
    // In real app, fetch reputation by userId
    const reputation = MOCK_REPUTATION;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <User className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Seller Profile
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </h1>
                    <p className="text-gray-500">Member since 2023 • Verified Business</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Stats - 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Reputation Overview</h2>
                    <ReputationSummary reputation={reputation} />

                    {/* Placeholder for Recent Reviews List */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400">
                        <p>Recent reviews would appear here...</p>
                    </div>
                </div>

                {/* Sidebar Stats - 1 col */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
                    <ReputationBreakdown reputation={reputation} />

                    <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-semibold mb-2">Trust Score</h3>
                        <p className="text-slate-300 text-sm mb-4">Calculated based on verified transactions, disputes, and longevity.</p>
                        <div className="text-3xl font-bold text-emerald-400">98/100</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
