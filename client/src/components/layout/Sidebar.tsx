import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    FileText,
    Wallet,
    Diamond,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Home,
    ShoppingBag,
    Store,
    Gavel,
    ShieldCheck,
    MessageSquare,
    Package,
} from "lucide-react";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onClose, collapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const pathname = location.pathname;

    const routes = [
        {
            label: "Home",
            icon: Home,
            href: "/",
            color: "text-blue-500",
        },
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-sky-500",
        },
        {
            label: "Profile",
            icon: User,
            href: "/profile",
            color: "text-violet-500",
        },
        {
            label: "KYC Verification",
            icon: FileText,
            href: "/kyc",
            color: "text-pink-700",
        },
        {
            label: "Wallet",
            icon: Wallet,
            href: "/wallet",
            color: "text-orange-700",
        },
        {
            label: "Marketplace",
            icon: Gavel,
            href: "/marketplace",
            color: "text-amber-500",
        },
        {
            label: "My Bids",
            icon: ShoppingBag,
            href: "/my-bids",
            color: "text-emerald-500",
        },
        {
            label: "Seller Dashboard",
            icon: Store,
            href: "/seller-dashboard",
            color: "text-purple-500",
        },
        {
            label: "Deals",
            icon: ShieldCheck,
            href: "/deals",
            color: "text-blue-600",
        },
        {
            label: "Messages",
            icon: MessageSquare,
            href: "/messages",
            color: "text-pink-500",
        },
        {
            label: "Inventory",
            icon: Package,
            href: "/inventory",
            color: "text-emerald-600",
        },
    ];

    return (
        <div className={cn("space-y-4 py-4 flex flex-col h-full overflow-y-auto bg-slate-900 text-white transition-all duration-300", className)}>
            <div className="px-3 py-2 flex-1">
                <div className="flex items-center justify-between mb-14 pl-3 relative group">
                    {/* <Menu clas/> */}
                    <Link to="/dashboard" className="flex items-center" onClick={onClose}>
                        <div className="relative w-8 h-8 mr-4">
                            <Diamond className="w-8 h-8 text-blue-500" />
                        </div>
                        {!collapsed && (
                            <h1 className="text-2xl font-bold transition-opacity duration-300">
                                Reyu
                            </h1>
                        )}
                    </Link>
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className={cn(
                                "hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-700 rounded-full items-center justify-center cursor-pointer hover:bg-slate-600 transition-opacity",
                                collapsed ? "opacity-100" : "opacity-0 group-hover:opacity-100" // Show always if collapsed, else only on hover
                            )}
                        >
                            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                    )}
                </div>

                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            to={route.href}
                            onClick={onClose}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? route.label : undefined}
                        >
                            <div className={cn("flex items-center flex-1", collapsed && "justify-center flex-none")}>
                                <route.icon className={cn("h-5 w-5", route.color, !collapsed && "mr-3")} />
                                {!collapsed && route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Link
                    to="/logout"
                    className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Logout" : undefined}
                >
                    <div className={cn("flex items-center flex-1", collapsed && "justify-center flex-none")}>
                        <LogOut className={cn("h-5 w-5 text-red-500", !collapsed && "mr-3")} />
                        {!collapsed && "Logout"}
                    </div>
                </Link>
            </div>
        </div>
    );
};
