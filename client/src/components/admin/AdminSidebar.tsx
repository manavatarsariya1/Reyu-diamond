import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UserCircle,
    FileCheck,
    Megaphone,
    Activity,
    Home,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Diamond
} from "lucide-react";

interface AdminSidebarProps {
    className?: string;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className, collapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const pathname = location.pathname;

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/admin",
            color: "text-sky-500",
        },
        {
            label: "KYC Verification",
            icon: FileCheck,
            href: "/admin/kyc",
            color: "text-emerald-500",
        },
        {
            label: "User Management",
            icon: UserCircle,
            href: "/admin/users",
            color: "text-violet-500",
        },
        {
            label: "Ads Approval",
            icon: Megaphone,
            href: "/admin/ads",
            color: "text-amber-500",
        },
        {
            label: "System Logs",
            icon: Activity,
            href: "/admin/logs",
            color: "text-red-500",
        },
        {
            label: "Main Site",
            icon: Home,
            href: "/",
            color: "text-gray-400",
        },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-slate-900 text-white transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
            <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-10 pl-2">
                    <Link to="/admin" className="flex items-center">
                        <Diamond className="w-8 h-8 text-blue-500 mr-2" />
                        {!collapsed && <span className="text-xl font-bold tracking-tight">Reyu Admin</span>}
                    </Link>
                </div>

                <nav className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            to={route.href}
                            className={cn(
                                "flex items-center p-3 text-sm font-medium rounded-lg transition-colors",
                                pathname === route.href 
                                    ? "bg-white/10 text-white" 
                                    : "text-zinc-400 hover:text-white hover:bg-white/5",
                                collapsed && "justify-center"
                            )}
                            title={collapsed ? route.label : undefined}
                        >
                            <route.icon className={cn("w-5 h-5", route.color, !collapsed && "mr-3")} />
                            {!collapsed && <span>{route.label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={onToggleCollapse}
                    className="flex items-center w-full p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    {collapsed ? <ChevronRight className="mx-auto" /> : (
                        <div className="flex items-center">
                            <ChevronLeft className="mr-2" />
                            <span className="text-sm">Collapse Sidebar</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
