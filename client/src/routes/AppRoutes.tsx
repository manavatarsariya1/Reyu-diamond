import React from 'react'
import DashboardPage from '@/pages/DashboardPage';
import KycPage from '@/pages/KycPage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import RegisterPage from '@/pages/RegisterPage';
import Verify from '@/pages/Verify';
import ProfilePage from '@/pages/ProfilePage';
import WalletPage from '@/pages/WalletPage';
import SettingsPage from '@/pages/SettingsPage';
// import PublicRoute from '@/routes/PublicRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createBrowserRouter } from 'react-router-dom';
import PreferencesPage from '@/pages/PreferencesPage';
import CreatePreferencePage from '@/pages/CreatePreferencePage';
import EditPreferencePage from '@/pages/EditPreferencePage';
import PublicRoute from './PublicRoute';
// import InventoryPage from '@/pages/InventoryPage';
import MarketplacePage from '@/pages/MarketplacePage';
import MyBidsPage from '@/pages/MyBidsPage';
import SellerDashboardPage from '@/pages/SellerDashboardPage';
import ListingDetailsPage from '@/pages/ListingDetailsPage';
import DealDashboardPage from '@/pages/DealDashboardPage';
import DealDetailsPage from '@/pages/DealDetailsPage';
import ChatPage from '@/pages/ChatPage';
import InventoryPage from '@/pages/InventoryPage';
import AddInventoryPage from '@/pages/AddInventoryPage';
// import ReputationPage from '@/pages/ReputationPage';
import RateDealPage from '@/pages/RateDealPage';
import ReputationPage from '@/pages/ReputationPage';
import PaymentPage from '@/pages/PaymentPage';
import EscrowDashboardPage from '@/pages/EscrowDashboardPage';



const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    // {
    //     path: "/inventory",
    //     element: <InventoryPage />,
    // },
    {
        path: "/login",
        element:
            <PublicRoute>
                <LoginPage />
            </PublicRoute>,
    },
    {
        path: "/register",
        element:
            <PublicRoute>
                <RegisterPage />
            </PublicRoute>
        ,
    },
    {
        path: "/verify-otp",
        element:
            // <PublicRoute>
                <Verify />
            // </PublicRoute>
    },
    {
        path: "/marketplace",
        element: <MarketplacePage />
    },
    {
        path: "/marketplace/:id",
        element: <ListingDetailsPage />
    },
    {
        path: "/reputation/:userId",
        element: <ReputationPage />
    },
    {
        path: "/ratedeal/:dealId",
        element: <RateDealPage />
    },
    {
        path: "/escrow/:dealId",
        element: <EscrowDashboardPage />
    },
    {
        path: "/payment/:dealId",
        element: <PaymentPage />
    },
    {
        element: <DashboardLayout />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />
            },
            {
                path: "/kyc",
                element: <KycPage />
            },
            {
                path: "/preferences",
                element: <PreferencesPage />
            },
            {
                path: "/preferences/create",
                element: <CreatePreferencePage />
            },
            {
                path: "/preferences/edit/:id",
                element: <EditPreferencePage />
            },
            {
                path: "/profile",
                element: <ProfilePage />
            },
            {
                path: "/wallet",
                element: <WalletPage />
            },
            {
                path: "/settings",
                element: <SettingsPage />
            },
            {
                path: "/my-bids",
                element: <MyBidsPage />
            },
            {
                path: "/seller-dashboard",
                element: <SellerDashboardPage />
            },
            {
                path: "/deals",
                element: <DealDashboardPage />
            },
            {
                path: "/deals/:id",
                element: <DealDetailsPage />
            },
            {
                path: "/messages",
                element: <ChatPage />
            },
            {
                path: "/messages/:id",
                element: <ChatPage />
            },
            {
                path: "/inventory",
                element: <InventoryPage />
            },
            {
                path: "/inventory/add",
                element: <AddInventoryPage />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);


export default AppRoutes