import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { user } = useSelector((state: any) => state.auth);

    if (user?.isVerified && user?.isKycVerified) {
        return <Navigate to="/" />;
    }

    if (user?.isVerified && !user?.isKycVerified) {
        return <Navigate to="/kyc" />;
    }

    if (user && !user?.isVerified) {
        return <Navigate to="/verify-otp" />;
    }


    return children
}

export default PublicRoute