import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '@/app/store';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, isProcessing } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (isProcessing) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location to return to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If they are an admin trying to go to user dashboard, let them (or vice versa? Usually admins can see everything)
        // But for strict separation:
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // Verification check for normal users
    if (user.role === 'user') {
        if (!user.isVerified) {
            return <Navigate to="/verify-otp" replace />;
        }
        // KYC check is usually only for certain features, but if it's global:
        // if (!user.isKycVerified && location.pathname !== '/kyc') {
        //     return <Navigate to="/kyc" replace />;
        // }
    }

    return <Outlet />;
};

export default ProtectedRoute;
