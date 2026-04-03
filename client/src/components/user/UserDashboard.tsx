import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from '@/api/analyticsService';
import {
  Gavel,
  Handshake,
  Package,
  CheckCircle2,
  AlertCircle,
  History,
  Sparkles,
  BarChart3,
} from 'lucide-react';

import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

import { requirementService, type Requirement } from '@/api/requirementService';
import ShareInquiryButton from '@/components/inquiry/ShareInquiryButton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';


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
    const [inquiries, setInquiries] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, inquiriesRes] = await Promise.all([
                    analyticsService.getUserDashboardStats(),
                    requirementService.getMyRequirements()
                ]);

                if (statsRes.success) {
                    setData(statsRes.data);
                }
                setInquiries(inquiriesRes || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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
                {/* My Inquiries (Requirements) Section */}
                <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg font-semibold flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                            My Diamond Inquiries
                        </CardTitle>
                        <Button size="sm" variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50" asChild>
                            <Link to="/inquiry/create" className="flex items-center gap-1.5">
                                <Plus className="w-4 h-4" /> New Inquiry
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {inquiries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 group">
                                {inquiries.map((req) => (
                                    <div key={req._id} className="p-6 hover:bg-indigo-50/30 transition-all duration-300 relative group/item">
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                                                        {req.carat}ct {req.shape}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 uppercase tracking-wider font-bold h-5">
                                                            {req.color}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 uppercase tracking-wider font-bold h-5">
                                                            {req.clarity}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-auto space-y-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 font-medium flex items-center gap-1">
                                                        <BarChart3 className="w-4 h-4" /> Budget
                                                    </span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                                        ${req.budget.toLocaleString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 pt-2">
                                                    <Button variant="ghost" size="sm" className="flex-1 rounded-xl text-slate-500 font-bold hover:bg-slate-100" asChild>
                                                        <Link to={`/inquiry/${req._id}`}>View Details</Link>
                                                    </Button>
                                                    <ShareInquiryButton 
                                                        inquiryId={req._id} 
                                                        carat={req.carat} 
                                                        shape={req.shape} 
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                    <Sparkles className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-bold mb-1">No Inquiries Yet</h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-[250px] mx-auto">Found a specific diamond you need? Post an inquiry and get offers from verified sellers.</p>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl" asChild>
                                    <Link to="/inquiry/create">Create My First Inquiry</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
