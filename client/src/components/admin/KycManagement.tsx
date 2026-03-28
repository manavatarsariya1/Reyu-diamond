import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import { fetchKycsStart } from '@/features/admin/adminSlice';
import { adminService } from '@/api/adminService';
import { 
    Check, 
    X, 
    Eye, 
    Search, 
    Filter,
    MoreVertical,
    Calendar,
    User,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const KycManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { kycs, loading } = useSelector((state: RootState) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchKycsStart());
    }, [dispatch]);

    const handleReview = async (userId: string, status: 'approved' | 'rejected', reason?: string) => {
        try {
            await adminService.reviewKyc(userId, status, reason);
            toast.success(`KYC ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
            dispatch(fetchKycsStart());
        } catch (error: any) {
            toast.error(error.message || "Failed to review KYC");
        }
    };

    const kycList = Array.isArray(kycs) ? kycs : [];
    const filteredKycs = kycList.filter(kyc => 
        kyc.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kyc.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kyc.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">KYC Verification</h2>
                    <p className="text-sm text-gray-500">Review and verify user identity documents.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                                 <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading.kycs ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredKycs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                            <p className="text-sm font-medium text-gray-900">No KYC submissions found</p>
                                            <p className="text-xs text-gray-500">Everything is caught up!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredKycs.map((kyc) => (
                                <tr key={kyc._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                {kyc.firstName?.[0]}{kyc.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{kyc.firstName} {kyc.lastName}</p>
                                                <p className="text-xs text-gray-500">{kyc.userId?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            {format(new Date(kyc.createdAt), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant={
                                                kyc.status === 'approved' ? 'default' : 
                                                kyc.status === 'pending' ? 'secondary' : 'destructive'
                                            }
                                            className="capitalize"
                                        >
                                            {kyc.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {(kyc.documents?.aadhaar?.url || kyc.documents?.aadhaar?.aadhaarImage) && (
                                                <button 
                                                    onClick={() => window.open(kyc.documents.aadhaar.url || kyc.documents.aadhaar.aadhaarImage, '_blank')}
                                                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Aadhaar
                                                </button>
                                            )}
                                            {(kyc.documents?.pan?.url || kyc.documents?.pan?.panImage) && (
                                                <button 
                                                    onClick={() => window.open(kyc.documents.pan.url || kyc.documents.pan.panImage, '_blank')}
                                                    className="flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    PAN
                                                </button>
                                            )}
                                            {!kyc.documents?.aadhaar?.url && !kyc.documents?.aadhaar?.aadhaarImage && !kyc.documents?.pan?.url && !kyc.documents?.pan?.panImage && (
                                                <span className="text-xs text-gray-400 italic">No documents</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {/* Removed generic eye button since we have specific ones above */}
                                            {kyc.status === 'pending' ? (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-400 hover:text-emerald-600"
                                                        onClick={() => handleReview(kyc.userId._id, 'approved')}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-400 hover:text-rose-600"
                                                        onClick={() => handleReview(kyc.userId._id, 'rejected', 'Documents are unclear')}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ):(
                                                <>
                                                <div className='mr-10'>Done</div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Showing {filteredKycs.length} submissions</p>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" disabled className="h-8 px-3 text-xs">Previous</Button>
                        <Button variant="outline" size="sm" disabled className="h-8 px-3 text-xs">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycManagement;
