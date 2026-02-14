import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { user } = useSelector((state: any) => state.auth);

    if (user?.isEmailVerified && user?.isKycVerified) {
        return <Navigate to="/" />;
    }

    if (user?.isEmailVerified && !user?.isKycVerified) {
        return <Navigate to="/kyc" />;
    }

    if (user && !user?.isEmailverified) {
        return <Navigate to="/verify-otp" />;
    }


    return children
}

export default PublicRoute