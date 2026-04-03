import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';
import { LayoutContext } from '@/utils/Layoutcontext';
import { StripeOnboardingBanner } from '../payment/StripeOnboardingBanner';
import Navbar from './Navbar';

import { useDispatch } from 'react-redux';
import { getProfileRequested } from '@/features/auth/auth.Slice';

const DashboardLayout = () => {
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    useEffect(() => {
        dispatch(getProfileRequested());
    }, [dispatch]);


      const showBanner = location.pathname === '/seller-dashboard';

    return (
        <LayoutContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen, isCollapsed, setIsCollapsed }}>
            <div className="h-full relative font-sans antialiased text-slate-500 bg-gray-50 dark:bg-slate-900">

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
                <Navbar/>

                {/* Main area */}
                <main className={cn(
                    "focus:outline-none transition-all duration-300",
                    isCollapsed ? "md:pl-20" : "md:pl-72"
                )}>
                    <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

                    {/* Mobile Sidebar Overlay */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 flex md:hidden">
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <div className="relative flex-1 w-full max-w-xs h-full bg-gray-900">
                                <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
                            </div>
                        </div>
                    )}

                    {/* Page content */}
                    <div className="h-full overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                        {showBanner && <StripeOnboardingBanner />}
                        <Outlet />
                    </div>
                </main>
            </div>
        </LayoutContext.Provider>
    );
};

export default DashboardLayout;