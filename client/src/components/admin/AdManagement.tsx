import React, { useEffect, useState } from 'react';
import api from '@/api/axios';
import { 
    Search, 
    Megaphone, 
    CheckCircle, 
    XCircle, 
    Tag,
    User,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdManagement: React.FC = () => {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/advertisements');
            // Extract the array from the wrapped object
            const adData = res.data.data?.advertisements || res.data.data || [];
            setAds(Array.isArray(adData) ? adData : []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch advertisements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleStatusUpdate = async (adId: string, status: string) => {
        let rejectionReason = "";
        
        if (status === 'REJECTED') {
            const reason = window.prompt("Please enter a reason for rejection:");
            if (reason === null) return; // Cancelled
            rejectionReason = reason;
        }

        try {
            await api.patch(`/advertisements/${adId}/status`, { 
                status,
                rejectionReason 
            });
            toast.success(`Advertisement ${status.toLowerCase()} successfully`);
            fetchAds();
        } catch (error: any) {
            toast.error(error.message || "Failed to update advertisement status");
        }
    };

    const adList = Array.isArray(ads) ? ads : [];
    const filteredAds = adList.filter(ad => 
        ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.advertiserId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
                    <p className="text-sm text-gray-500">Review and moderate platform advertisements.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search ads or advertisers..." 
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Content</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Advertiser</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredAds.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Megaphone className="w-12 h-12 text-gray-200 mb-4" />
                                            <p className="text-sm font-medium text-gray-900">No advertisements found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAds.map((ad) => (
                                <tr key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                                {ad.mediaUrl ? (
                                                    <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{ad.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{ad.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{ad.advertiserId?.username || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant={
                                                ad.status === 'APPROVED' ? 'default' : 
                                                ad.status === 'PENDING' ? 'secondary' : 'destructive'
                                            }
                                            className="uppercase text-[10px]"
                                        >
                                            {ad.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            {format(new Date(ad.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                            {ad.status === 'PENDING' && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-400 hover:text-emerald-600"
                                                        onClick={() => handleStatusUpdate(ad._id, 'APPROVED')}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-400 hover:text-rose-600"
                                                        onClick={() => handleStatusUpdate(ad._id, 'REJECTED')}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdManagement;
