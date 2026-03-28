import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "@/app/store";
import { ratingService } from "@/api/ratingService";
import { inventoryService } from "@/api/inventoryService";
import { auctionService } from "@/api/auctionService";
import { bidService } from "@/api/bidService";
import type { Reputation } from "@/types/rating";
import { 
    User, ShieldCheck, ShieldAlert, Star, 
    Calendar, Loader2, Package, Mail, 
    Wallet, Gavel, LayoutDashboard, Settings,
    ChevronRight, ArrowUpRight, Award, Clock
} from "lucide-react";
import { format } from "date-fns";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ReputationBreakdown } from "@/components/reputation/ReputationBreakdown";

export default function ProfilePage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [reputation, setReputation] = useState<Reputation | null>(null);  
    const [stats, setStats] = useState({
        activeListings: 0,
        activeAuctions: 0,
        activeBids: 0,
        totalInventory: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = user?.id || (user as any)?._id;
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [repRes, invRes, aucRes, bidRes] = await Promise.all([
                    ratingService.getUserReputation(userId),
                    inventoryService.fetchInventories({ sellerId: userId }),
                    auctionService.getAuctions(), 
                    bidService.getAllMyBids()
                ]);

                if (repRes.success && repRes.data) {
                    const raw = repRes.data as any;
                    setReputation({
                        userId: raw.user._id,
                        averageScore: raw.stats.averageScore,
                        totalRatings: raw.stats.totalRatings,
                        totalDeals: raw.stats.totalRatings,
                        badgeTier: raw.user.badges.find((b: string) => 
                            ["DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE"].includes(b)
                        ) || 'BRONZE',
                        distribution: raw.stats.distribution,
                        recentRatings: raw.recentRatings
                    });
                }

                if (Array.isArray(invRes)) {
                    setStats(prev => ({ 
                        ...prev, 
                        totalInventory: invRes.length,
                        activeListings: invRes.filter(i => i.status === "LISTED").length 
                    }));
                }

                if (Array.isArray(aucRes)) {
                   const myAuctions = aucRes.filter((a: any) => 
                        (typeof a.recipient === 'object' ? a.recipient._id : a.recipient) === user.id
                    );
                   setStats(prev => ({ ...prev, activeAuctions: myAuctions.length }));
                }

                if (Array.isArray(bidRes)) {
                    setStats(prev => ({ ...prev, activeBids: bidRes.length }));
                }

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Personalizing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header / Profile Hero */}
            <div className="relative bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-sm overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-100/50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/30 rounded-full blur-[80px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-10">
                    {/* Avatar Block */}
                    <div className="relative">
                        <div className="h-40 w-40 bg-white rounded-[3rem] p-4 shadow-xl border border-slate-50 flex items-center justify-center group/avatar">
                            <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center overflow-hidden">
                                <User className="w-20 h-20 text-slate-300 group-hover/avatar:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                        {user?.isKycVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white animate-bounce-subtle">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        )}
                    </div>

                    {/* Info Block */}
                    <div className="flex-1 text-center lg:text-left space-y-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase font-luxury italic">
                                    {user?.username}
                                </h1>
                                {reputation && <ReputationBadge tier={reputation.badgeTier} />}
                                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-bold px-3 py-1 rounded-lg">
                                    ID: {user?.id?.slice(-8).toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm font-medium pt-2">
                                <span className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-indigo-400" /> {user?.email}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-400" /> Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                            <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 shadow-xl transition-all hover:-translate-y-0.5" asChild>
                                <Link to="/inventory/add">Submit New Stone</Link>
                            </Button>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-700" asChild>
                                <Link to="/settings"><Settings className="w-4 h-4 mr-2" /> Account Settings</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Reputation Quick Metric */}
                    <div className="hidden xl:block w-72 h-full">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reputation Score</p>
                                    <div className="text-4xl font-black text-emerald-400 italic tracking-tighter">
                                        {Math.round((reputation?.averageScore || 0) * 20)}<span className="text-slate-600 text-xl font-normal not-italic">/100</span>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Next Tier</span>
                                        <span className="text-indigo-400">Platinum</span>
                                    </div>
                                    <Progress value={75} className="h-1.5 bg-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Section */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DashboardMetricCard 
                        icon={<LayoutDashboard className="text-indigo-600" />}
                        label="Active Listings"
                        value={stats.activeListings}
                        subValue={`${stats.totalInventory} Total Stones`}
                        link="/inventory"
                    />
                    <DashboardMetricCard 
                        icon={<Gavel className="text-amber-600" />}
                        label="Ongoing Auctions"
                        value={stats.activeAuctions}
                        subValue="Live Bidding Sessions"
                        link="/seller-dashboard"
                        color="amber"
                    />
                    <DashboardMetricCard 
                        icon={<ArrowUpRight className="text-emerald-600" />}
                        label="Current Bids"
                        value={stats.activeBids}
                        subValue="Watching Items"
                        link="/my-bids"
                        color="emerald"
                    />
                    <DashboardMetricCard 
                        icon={<Wallet className="text-slate-600" />}
                        label="Escrow Balance"
                        value="$0.00"
                        subValue="Secured Funds"
                        link="/wallet"
                        color="slate"
                    />
                </div>

                {/* Status Sidebar */}
                <div className="space-y-6">
                    {/* KYC Status Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Verification</h3>
                            {user?.isKycVerified ? (
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />
                            )}
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-3 w-3 rounded-full ${user?.isVerified ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">Email Verified</p>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Core Security Established</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`h-3 w-3 rounded-full ${user?.isKycVerified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">KYC Verification</p>
                                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">
                                        {user?.isKycVerified ? 'Identity Fully Authenticated' : 'Action Required for Trading'}
                                    </p>
                                </div>
                            </div>
                            {!user?.isKycVerified && (
                                <Button className="w-full mt-2 h-12 bg-amber-50 text-amber-600 hover:bg-amber-100 border-none font-bold" asChild>
                                    <Link to="/kyc">Complete Verification</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Promotion Center Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award className="w-24 h-24" />
                        </div>
                        <h3 className="font-black text-lg mb-2 italic">Ad Specialist</h3>
                        <p className="text-indigo-100/70 text-sm mb-6 leading-relaxed">Boost your inventory visibility and reach global buyers with targeted ad placements.</p>
                        <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold rounded-xl" asChild>
                            <Link to="/ads">Promote Inventory</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reputation Section Preview */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-luxury italic">Reputation Portfolio</h2>
                    <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl" asChild>
                        <Link to={`/reputation/${user?.id || (user as any)?._id}`}>Full Documentation <ChevronRight className="w-4 h-4 ml-1" /></Link>
                    </Button>
                </div>
                
                {reputation ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="space-y-6">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Performance Insights</div>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Client Satisfaction</span>
                                    <span className="text-sm font-black text-emerald-600">{(reputation.averageScore * 20).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Response Integrity</span>
                                    <span className="text-sm font-black text-indigo-600">High</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Deal Completion</span>
                                    <span className="text-sm font-black text-slate-900">{reputation.totalDeals}</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                             <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Activity Breakdown</div>
                             <ReputationBreakdown reputation={reputation} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Reputation data will appear after your first successful transaction.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue: string;
    link: string;
    color?: 'indigo' | 'amber' | 'emerald' | 'slate';
}

function DashboardMetricCard({ icon, label, value, subValue, link, color = 'indigo' }: MetricCardProps) {
    return (
        <Link to={link} className="block group">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 h-full min-h-[180px] flex flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-50`}>
                            {icon}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-300 transition-colors" />
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter mb-1">{value}</h3>
                   <p className="text-sm font-bold text-slate-800">{label}</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                   {subValue}
                </p>
            </div>
        </Link>
    );
}
