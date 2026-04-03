import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '@/app/store';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isProcessing } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (isProcessing) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (user) {
        // Correct path based on role and verification
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        if (!user.isVerified) {
            return <Navigate to="/verify-otp" replace />;
        }
        // If they are trying to go to login, but are already logged in, send them where they belong
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;