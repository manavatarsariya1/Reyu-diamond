import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from '@/api/analyticsService';
import { adService } from "@/api/adService";
import type { Advertisement } from "@/api/adService";
import {
  Gavel,
  Handshake,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdCarousel from '@/components/ads/AdCarousel';

interface DashboardData {
    stats: {
        totalBids: number;
        activeBids: number;
        totalDeals: number;
        activeDeals: number;
        totalInventory: number;
        kycStatus: string;
    };
    recentBids: any[];
    recentDeals: any[];
}

const UserDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await analyticsService.getUserDashboardStats();
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const stats = data?.stats;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* <AdCarousel section="HOME_DASHBOARD" className="mb-0" /> */}
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome Back</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Here's an overview of your activity on Reyu Diamond.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={stats?.kycStatus === 'approved' ? 'default' : 'secondary'} className="px-3 py-1 text-sm">
                        {stats?.kycStatus === 'approved' ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> KYC Verified</>
                        ) : (
                            <><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> KYC {stats?.kycStatus || 'Pending'}</>
                        )}
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Active Bids" 
                    value={stats?.activeBids || 0} 
                    icon={<Gavel className="w-5 h-5 text-blue-500" />}
                    description="Bids currently in active auctions"
                    trend={stats?.totalBids ? `Total: ${stats.totalBids}` : ""}
                />
                <StatCard 
                    title="Ongoing Deals" 
                    value={stats?.activeDeals || 0} 
                    icon={<Handshake className="w-5 h-5 text-emerald-500" />}
                    description="Deals awaiting completion"
                    trend={stats?.totalDeals ? `Total: ${stats.totalDeals}` : ""}
                />
                <StatCard 
                    title="My Inventory" 
                    value={stats?.totalInventory || 0} 
                    icon={<Package className="w-5 h-5 text-orange-500" />}
                    description="Diamonds listed or in progress"
                />
                <StatCard 
                    title="Completed Deals" 
                    value={(stats?.totalDeals || 0) - (stats?.activeDeals || 0)} 
                    icon={<CheckCircle2 className="w-5 h-5 text-purple-500" />}
                    description="Successfully finalized deals"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Bids */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center">
                                <History className="w-5 h-5 mr-2 text-blue-500" />
                                Recent Bids
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data?.recentBids && data.recentBids.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.recentBids.map((bid) => (
                                    <div key={bid._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                                    {bid.auctionId?.inventoryId?.title || 'Unknown Diamond'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    {bid.auctionId?.inventoryId?.shape} • {bid.auctionId?.inventoryId?.carat} Carat
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                                    ${bid.bidAmount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(bid.createdAt), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white dark:bg-slate-950">
                                <Gavel className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                                <p className="text-slate-500">No recent bids found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Deals */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center">
                                <Handshake className="w-5 h-5 mr-2 text-emerald-500" />
                                Recent Deals
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data?.recentDeals && data.recentDeals.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.recentDeals.map((deal) => (
                                    <div key={deal._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {deal.auctionId?.inventoryId?.title || 'System Deal'}
                                                    </p>
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 leading-none uppercase">
                                                        {deal.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    With: {deal.sellerId?.username === 'Self' ? deal.buyerId?.username : deal.sellerId?.username}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                                    ${deal.agreedAmount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(deal.createdAt), 'MMM d')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white dark:bg-slate-950">
                                <Handshake className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                                <p className="text-slate-500">No recent deals found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, description, trend }: any) => (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900/40 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
                <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
                <p className="text-xs text-slate-400 mt-2">{description}</p>
            </div>
        </CardContent>
    </Card>
);

const DashboardSkeleton = () => (
    <div className="p-6 space-y-8">
        <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-none shadow-md">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
                <Card key={i} className="border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

export default UserDashboard;
