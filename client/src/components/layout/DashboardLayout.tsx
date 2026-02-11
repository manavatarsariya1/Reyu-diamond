import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';
import Navbar from './Navbar';

// Since I don't know if Sheet component exists, I'll use a custom implementation for mobile drawer using standard React state and CSS for now to be safe and dependency-free, 
// or I can check for Sheet component. The user said "Tailwind CSS styling" and "React + TypeScript". 
// Let's check for shadcn Sheet component first to be sure.
// But to avoid delay, I will implement a responsive layout relative to standard tailwind classes.

const DashboardLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="h-full relative font-sans antialiased text-slate-500 bg-gray-50 dark:bg-slate-900">
            {/* <Navbar/> */}
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 transition-all duration-300",
                isCollapsed ? "md:w-20" : "md:w-72"
            )}>
                <Sidebar
                    collapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                /> 
            </div>

            {/* Mobile Header & Sidebar */}
            <main className={cn(
                "md:pl-72 focus:outline-none transition-all duration-300",
                isCollapsed ? "md:pl-20" : "md:pl-72"
            )}>
                <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
                

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 flex md:hidden">
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <div className="relative flex-1 w-full max-w-xs h-full bg-gray-900 transition-transform duration-300 ease-in-out transform translate-x-0">
                            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="h-full p-4 md:p-8 overflow-y-auto ">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
