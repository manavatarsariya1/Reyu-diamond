import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReputationSummary } from "@/components/reputation/ReputationSummary";
import { ReputationBreakdown } from "@/components/reputation/ReputationBreakdown";
import { ratingService } from "@/api/ratingService";
import type { Reputation, Rating, BadgeTier } from "@/types/rating";
import { User, ShieldCheck, Star, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";

export default function ReputationPage() {
    const { userId } = useParams();
    const [reputation, setReputation] = useState<Reputation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReputation = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const response = await ratingService.getUserReputation(userId);
                if (response.success && response.data) {
                    // Map backend response to Reputation type
                    const raw = response.data as any;
                    const mapped: Reputation = {
                        userId: raw.user._id,
                        averageScore: raw.stats.averageScore,
                        totalRatings: raw.stats.totalRatings,
                        totalDeals: raw.stats.totalRatings, // Approximation if not explicitly sent
                        badgeTier: raw.user.badges.find((b: string) => 
                            ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"].includes(b)
                        ) || 'BRONZE',
                        distribution: raw.stats.distribution,
                        recentRatings: raw.recentRatings.map((r: any) => ({
                            id: r._id,
                            dealId: r.dealId?._id || r.dealId,
                            raterId: r.raterId?._id || r.raterId,
                            raterName: r.raterId?.username || "Anonymous",
                            score: r.score,
                            comment: r.feedback,
                            createdAt: r.createdAt
                        }))
                    };
                    setReputation(mapped);
                }
            } catch (err: any) {
                console.error("Failed to fetch reputation:", err);
                setError("Failed to load user reputation details.");
            } finally {
                setLoading(false);
            }
        };

        fetchReputation();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Analyzing reputation metrics...</p>
            </div>
        );
    }

    if (error || !reputation) {
        return (
            <div className="p-12 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block mb-4">
                    {error || "User not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-10">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center border border-slate-200 shadow-inner">
                        <User className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase font-luxury">
                                Seller Profile
                            </h1>
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-4 h-4" />
                                Member since 2024
                            </span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="text-emerald-600 font-bold">Verified Institution</span>
                        </div>
                    </div>
                </div>
                <ReputationBadge tier={reputation.badgeTier} className="h-12 px-6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Performance Overview</h2>
                        <ReputationSummary reputation={reputation} />
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Recent Feedback</h2>
                        {reputation.recentRatings && reputation.recentRatings.length > 0 ? (
                            <div className="space-y-4">
                                {reputation.recentRatings.map((review) => (
                                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:border-slate-200 hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">
                                                    {(review as any).raterName?.[0] || "A"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{(review as any).raterName || "Anonymous"}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-3.5 h-3.5 ${i < review.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed italic">
                                            "{review.comment || "The transaction was completed successfully without additional comments."}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
                                <p className="text-slate-400 font-medium">No reviews documented yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Analytics</h2>
                        <ReputationBreakdown reputation={reputation} />
                    </div>

                    {/* Trust Card */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Trust Score</h3>
                            <div className="text-5xl font-black text-emerald-400 mb-4 italic tracking-tighter">
                                {Math.round(reputation.averageScore * 20)}<span className="text-slate-600 text-2xl font-normal not-italic">/100</span>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Calculated across {reputation.totalRatings} verified transactions and successful dispute resolutions.
                            </p>
                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-3">
                                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 w-[94%]" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500">EXCELLENT</span>
                            </div>
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
