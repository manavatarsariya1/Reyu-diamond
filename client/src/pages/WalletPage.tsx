import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllDealsRequest } from '@/features/deal/dealSlice';
import type { AppDispatch, RootState } from '@/app/store';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    TrendingUp, 
    Plus, 
    RefreshCw, 
    ExternalLink,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function WalletPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { deals, isLoading } = useSelector((state: RootState) => state.deal);
    const { user } = useSelector((state: RootState) => state.auth);

    const currentUserId = user?._id || user?.id;

    const extractId = (u: any) => {
        if (!u) return "";
        let id = "";
        if (typeof u === 'string') id = u;
        else if (u._id) id = String(u._id);
        else if (u.id) id = String(u.id);
        
        // Prevent matching if id became "[object Object]"
        if (id === "[object Object]") return "";
        return id;
    };

    useEffect(() => {
        dispatch(fetchAllDealsRequest());
    }, [dispatch]);

    // Calculate Stats
    const stats = useMemo(() => {
        const rawId = currentUserId;
        const userIdStr = (rawId && typeof rawId === 'string') ? rawId.toLowerCase() : (rawId ? String(rawId).toLowerCase() : "");
        
        // Final guard against failed serialization
        if (!userIdStr || userIdStr === "[object object]") {
            return { total: 0, pending: 0, lifetime: 0 };
        }

        if (!deals || !deals.length) {
            return { total: 0, pending: 0, lifetime: 0 };
        }

        // As Seller: Funds pending in escrow or waiting for payment
        const pendingAsSeller = deals
            .filter(d => 
                (d.status === 'IN_ESCROW' || d.status === 'PAYMENT_PENDING') && 
                extractId(d.sellerId).toLowerCase() === userIdStr
            )
            .reduce((acc, d) => acc + (d.agreedAmount || 0), 0);

        // As Buyer: Funds already paid and held in escrow
        const pendingAsBuyer = deals
            .filter(d => 
                d.status === 'IN_ESCROW' && 
                extractId(d.buyerId).toLowerCase() === userIdStr
            )
            .reduce((acc, d) => acc + (d.agreedAmount || 0), 0);
            
        // Completed sales (Realized earnings)
        const lifetimeEarnings = deals
            .filter(d => 
                d.status === 'COMPLETED' && 
                extractId(d.sellerId).toLowerCase() === userIdStr
            )
            .reduce((acc, d) => acc + (d.agreedAmount || 0), 0);

        return {
            total: lifetimeEarnings, 
            pending: pendingAsSeller + pendingAsBuyer,
            lifetime: lifetimeEarnings
        };
    }, [deals, currentUserId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1">Completed</Badge>;
            case 'IN_ESCROW':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">In Escrow</Badge>;
            case 'PAYMENT_PENDING':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1">Pending Payment</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-3 py-1">Cancelled</Badge>;
            default:
                return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
                    <p className="text-slate-500 mt-1">Manage your funds, escrow payments, and sales earnings.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-xl border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => dispatch(fetchAllDealsRequest())}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2 text-slate-500", isLoading && "animate-spin")} />
                        {isLoading ? 'Syncing...' : 'Sync Account'}
                    </Button>
                    <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Funds
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance */}
                <div className="relative overflow-hidden group rounded-[2rem] p-8 bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-slate-900 rounded-2xl">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center">
                                <TrendingUp size={12} className="mr-1" /> Active
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Available Balance</p>
                        <h2 className="text-4xl font-bold text-slate-900 mt-1">₹{stats.total.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Pending Escrow */}
                <div className="relative overflow-hidden group rounded-[2rem] p-8 bg-blue-600 text-white shadow-lg shadow-blue-200/50 transition-all hover:shadow-xl hover:shadow-blue-200/60">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm font-medium">Pending Escrow</p>
                        <h2 className="text-4xl font-bold mt-1">₹{stats.pending.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Lifetime Earnings */}
                <div className="relative overflow-hidden group rounded-[2rem] p-8 bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-slate-100 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-slate-600" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Lifetime Earnings</p>
                        <h2 className="text-4xl font-bold text-slate-900 mt-1">₹{stats.lifetime.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
                        <p className="text-sm text-slate-500">History of your diamond sales and escrow holds.</p>
                    </div>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View More
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {deals.length > 0 ? (
                                deals.map((deal) => {
                                    const sellerIdStr = extractId(deal.sellerId).toLowerCase();
                                    const userIdStr = currentUserId ? String(currentUserId).toLowerCase() : "";
                                    const isSeller = userIdStr && userIdStr !== "[object object]" && sellerIdStr === userIdStr;
                                    return (
                                        <tr key={deal._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors group-hover:scale-105",
                                                        isSeller ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {isSeller ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {isSeller ? "Payment Received" : "Payment Sent"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">
                                                            Deal #{deal._id.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {getStatusBadge(deal.status)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                    <span className="text-sm">{format(new Date(deal.createdAt), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className={cn(
                                                    "font-bold text-lg",
                                                    isSeller ? "text-emerald-600" : "text-slate-900"
                                                )}>
                                                    {isSeller ? "+" : "-"}₹{deal.agreedAmount.toLocaleString()}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                                                <RefreshCw className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900">No transactions found</h4>
                                            <p className="text-sm text-slate-500 mt-1">
                                                When you buy or sell diamonds, your transaction history will appear here.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 backdrop-blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="text-blue-400" />
                            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">Escrow Protection</span>
                        </div>
                        <h3 className="text-2xl font-bold">Your funds are protected by our secure escrow system.</h3>
                        <p className="text-slate-400 mt-2">
                            Payments are held securely in escrow until both parties confirm delivery, ensuring a transparent and trust-paved transaction for every diamond deal.
                        </p>
                    </div>
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 rounded-2xl font-bold text-lg shrink-0">
                        Learn More <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
