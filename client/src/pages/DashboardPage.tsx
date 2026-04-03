import React, { useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/app/store'

const DashboardPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div>
            <Dashboard/>
        </div>
    )
}

export default DashboardPage