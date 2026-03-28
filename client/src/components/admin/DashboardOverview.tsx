import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import { fetchStatsStart } from '@/features/admin/adminSlice';
import StatsCard from './StatsCard';
import { 
    Users, 
    Gavel, 
    TrendingUp, 
    BadgeCheck,
    Clock,
    AlertCircle,
    Activity,
    Megaphone
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const DashboardOverview: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        dispatch(fetchStatsStart());
    }, [dispatch]);

    // Placeholder data for the chart until real analytics are integrated
    const chartData = [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    if (loading.stats && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Last updated: Just now</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Total Users" 
                    value={stats?.totalUsers || 0} 
                    icon={Users} 
                    color="blue"
                    trend={{ value: '+12%', positive: true }}
                />
                <StatsCard 
                    title="Active Auctions" 
                    value={stats?.activeAuctions || 0} 
                    icon={Gavel} 
                    color="emerald"
                    trend={{ value: '+5%', positive: true }}
                />
                <StatsCard 
                    title="Total Revenue" 
                    value={`₹${stats?.totalRevenue || 0}`} 
                    icon={TrendingUp} 
                    color="violet"
                    trend={{ value: '+18%', positive: true }}
                />
                <StatsCard 
                    title="Pending KYC" 
                    value={stats?.pendingKyc || 0} 
                    icon={BadgeCheck} 
                    color="amber"
                    trend={{ value: '-2%', positive: false }}
                />
                <StatsCard 
                    title="Pending Ads" 
                    value={stats?.pendingAds || 0} 
                    icon={Megaphone} 
                    color="rose"
                    trend={{ value: 'Review required', positive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Performance</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / System Health */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Clock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Server Uptime</p>
                                <p className="text-xs text-gray-500">99.98% - Healthy</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">API Response Time</p>
                                <p className="text-xs text-gray-500">240ms avg</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Database Load</p>
                                <p className="text-xs text-gray-500">Low - 12%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
