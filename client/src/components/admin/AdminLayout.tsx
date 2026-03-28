import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Bell, Search, User } from "lucide-react";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <AdminSidebar 
                collapsed={collapsed} 
                onToggleCollapse={() => setCollapsed(!collapsed)} 
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (OMITTED for brevity in replacement, but I will include it) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-96 max-w-full">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search everything..." 
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <div className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-tight">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
