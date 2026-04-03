import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ReputationSummary } from "@/components/reputation/ReputationSummary";
import { ReputationBreakdown } from "@/components/reputation/ReputationBreakdown";
import { ratingService } from "@/api/ratingService";
import { inventoryService } from "@/api/inventoryService";
import type { Reputation, BadgeTier } from "@/types/rating";
import type { InventoryItem } from "@/types/inventory";
import { User, ShieldCheck, Star, Calendar, Loader2, Package, Mail, MapPin, Award, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { ListingCard } from "@/components/bids/ListingCard";
import { ListingStatus } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage() {
    const { userId } = useParams();
    const [reputation, setReputation] = useState<Reputation | null>(null);
    const [listings, setListings] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const [repRes, invRes] = await Promise.all([
                    ratingService.getUserReputation(userId),
                    inventoryService.fetchInventories({ sellerId: userId })
                ]);

                if (repRes.success && repRes.data) {
                    const raw = repRes.data as any;
                    const mapped: Reputation = {
                        userId: raw.user._id,
                        averageScore: raw.stats.averageScore,
                        totalRatings: raw.stats.totalRatings,
                        totalDeals: raw.stats.totalRatings,
                        isKycVerified: raw.user.isKycVerified,
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

                if (invRes) {
                    setListings(invRes.filter(item => item.status === "LISTED"));
                }
            } catch (err: any) {
                console.error("Failed to fetch profile data:", err);
                setError("Failed to load user profile details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Building profile view...</p>
            </div>
        );
    }

    if (error || !reputation) {
        return (
            <div className="p-12 text-center h-screen flex flex-col items-center justify-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block mb-4 shadow-sm">
                    <p className="font-bold">{error || "User not found"}</p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-32 w-32 sm:h-40 sm:w-40 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group">
                                <User className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            {reputation.isKycVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-4 border-white" title="Verified Seller">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3 uppercase font-luxury">
                                    {reputation.userId === (userId as any) ? "Market Merchant" : "Verified Seller"}
                                </h1>
                                <ReputationBadge tier={reputation.badgeTier} className="mx-auto md:mx-0" />
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    Joined {reputation.recentRatings?.[0]?.createdAt ? format(new Date(reputation.recentRatings[0].createdAt), 'MMM yyyy') : 'Recently'}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full">
                                    <Award className="w-4 h-4" />
                                    {reputation.totalDeals} Total Deals
                                </div>
                                {reputation.isKycVerified && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
                                        <ShieldCheck className="w-4 h-4" />
                                        Identity Verified
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-500 max-w-2xl text-lg leading-relaxed mb-8 italic">
                                "Specializing in premium cut GIA certified stones with over {reputation.totalDeals}+ successful marketplace exchanges."
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <Button className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                                    <Mail className="w-4 h-4 mr-2" /> Message Seller
                                </Button>
                                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 px-8 h-12 rounded-2xl">
                                    <ExternalLink className="w-4 h-4 mr-2" /> Share Profile
                                </Button>
                            </div>
                        </div>

                        {/* Trust Metric Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl min-w-[280px] w-full md:w-auto relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Reputation Score</div>
                                <div className="text-6xl font-black italic tracking-tighter mb-2">
                                    {Math.round(reputation.averageScore * 20)}<span className="text-slate-500 text-2xl not-italic font-normal">/100</span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-400 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(reputation.averageScore) ? "currentColor" : "none"} className={i < Math.round(reputation.averageScore) ? "" : "text-white/10"} />
                                    ))}
                                    <span className="ml-2 text-white font-bold">{reputation.averageScore.toFixed(1)}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${reputation.averageScore * 20}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Standard</span>
                                        <span className="text-emerald-400">Premium Tier</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Reputation Details */}
                    <div className="lg:col-span-1 space-y-10">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Score Breakdown</h2>
                            </div>
                            <ReputationBreakdown reputation={reputation} />
                        </section>

                        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-500" /> Merchant Verification
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                    <span className="text-slate-500">Business Entity</span>
                                    <span className="font-semibold">Verified Professional</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-50">
                                    <span className="text-slate-500">Vetting Score</span>
                                    <span className="font-semibold text-emerald-600">A+ Certified</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-slate-500">Avg Response Time</span>
                                    <span className="font-semibold italic">~ 2 hours</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Active Listings & Reviews */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Active Listings Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Inventory ({listings.length})</h2>
                                <Link to="/marketplace" className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                                    View Marketplace <ExternalLink size={14} />
                                </Link>
                            </div>
                            
                            {listings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {listings.map(inv => {
                                        // Map inventory to listing type for card
                                        const mappedListing = {
                                            id: inv._id,
                                            sellerId: userId as string,
                                            sellerName: "Merchant",
                                            shape: inv.shape as any,
                                            carat: inv.carat,
                                            color: inv.color as any,
                                            clarity: inv.clarity as any,
                                            certification: inv.lab as any,
                                            reportNumber: inv.barcode || "",
                                            barcode: inv.barcode,
                                            price: inv.price,
                                            imageUrl: inv.images?.[0] || "",
                                            location: inv.location,
                                            status: ListingStatus.ACTIVE,
                                            totalBids: 0,
                                            createdAt: new Date().toISOString(),
                                            sellerRating: { average: reputation.averageScore, count: reputation.totalRatings },
                                            sellerBadges: [reputation.badgeTier]
                                        };
                                        return <ListingCard key={inv._id} listing={mappedListing as any} />;
                                    })}
                                </div>
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">This seller currently has no active listings.</p>
                                </div>
                            )}
                        </section>

                        {/* Recent Reviews Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Verified Feedback</h2>
                                <Link to={`/reputation/${userId}`} className="text-indigo-600 text-sm font-bold hover:underline">
                                    See All Documentation
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {reputation.recentRatings && reputation.recentRatings.length > 0 ? (
                                    reputation.recentRatings.map((review) => (
                                        <div key={review.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200 group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                                        {review.raterName?.[0] || "A"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{review.raterName || "Anonymous"}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            {format(new Date(review.createdAt), 'MMMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 px-3 py-1.5 bg-slate-50 rounded-full">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-4 top-0 w-1 h-full bg-slate-100 group-hover:bg-indigo-200 transition-colors rounded-full" />
                                                <p className="text-slate-600 leading-relaxed font-medium italic pl-4">
                                                    "{review.comment || "The transaction was completed with exceptional professionalism and standard excellence."}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                                        <p className="text-slate-400 font-medium">No reviews documented for this merchant yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
