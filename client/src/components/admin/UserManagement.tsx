import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import { fetchUsersStart } from '@/features/admin/adminSlice';
import { adminService } from '@/api/adminService';
import { 
    Search, 
    Filter,
    Shield,
    ShieldAlert,
    MoreHorizontal,
    Mail,
    UserCheck,
    UserX,
    Lock,
    Unlock,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const UserManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading } = useSelector((state: RootState) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchUsersStart());
    }, [dispatch]);

    const handleStatusUpdate = async (userId: string, status: "ACTIVE" | "DEACTIVE") => {
        try {
            await adminService.updateUserStatus(userId, status);
            toast.success(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
            dispatch(fetchUsersStart());
        } catch (error: any) {
            toast.error(error.message || "Failed to update user status");
        }
    };

    const userList = Array.isArray(users) ? users : [];
    const filteredUsers = userList.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">Manage platform users, roles, and account status.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search email or username..." 
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading.users ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                                                {user.username?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {user.role === 'admin' ? (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center">
                                                    <Shield className="w-3 h-3 mr-1" /> Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">User</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant={user.accountStatus === 'ACTIVE' ? 'default' : 'destructive'}
                                            className="px-2 py-0.5 rounded-md text-[10px]"
                                        >
                                            {user.accountStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {user.isKycVerified ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none flex items-center">
                                                    <UserCheck className="w-3 h-3 mr-1" /> Verified
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-50 text-gray-400 hover:bg-gray-50 border-none flex items-center">
                                                    <UserX className="w-3 h-3 mr-1" /> Not Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Activity className="w-4 h-4 mr-2" /> View Activity
                                                </DropdownMenuItem>
                                                {user.accountStatus === 'ACTIVE' ? (
                                                    <DropdownMenuItem 
                                                        className="text-rose-600 focus:text-rose-600"
                                                        onClick={() => handleStatusUpdate(user._id, 'DEACTIVE')}
                                                    >
                                                        <Lock className="w-4 h-4 mr-2" /> Deactivate User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        className="text-emerald-600 focus:text-emerald-600"
                                                        onClick={() => handleStatusUpdate(user._id, 'ACTIVE')}
                                                    >
                                                        <Unlock className="w-4 h-4 mr-2" /> Activate User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

export default UserManagement;
