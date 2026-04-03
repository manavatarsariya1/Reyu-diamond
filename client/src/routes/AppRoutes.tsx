import DashboardPage from '@/pages/DashboardPage';
import KycPage from '@/pages/KycPage';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import RegisterPage from '@/pages/RegisterPage';
import Verify from '@/pages/Verify';
import ProfilePage from '@/pages/ProfilePage';
import WalletPage from '@/pages/WalletPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createBrowserRouter } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import MarketplacePage from '@/pages/MarketplacePage';
import MyBidsPage from '@/pages/MyBidsPage';
import SellerDashboardPage from '@/pages/SellerDashboardPage';
import ListingDetailsPage from '@/pages/ListingDetailsPage';
import DealDashboardPage from '@/pages/DealDashboardPage';
import DealDetailsPage from '@/pages/DealDetailsPage';
import ChatPage from '@/pages/ChatPage';
import InventoryPage from '@/pages/InventoryPage';
import AddInventoryPage from '@/pages/AddInventoryPage';
import RateDealPage from '@/pages/RateDealPage';
import ReputationPage from '@/pages/ReputationPage';
import PaymentPage from '@/pages/PaymentPage';
import InventoryDetails from '@/components/inventory/InventoryDetails';
import { StripeOnboardingBanner } from '@/components/payment/StripeOnboardingBanner';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardOverview from '@/components/admin/DashboardOverview';
import KycManagement from '@/components/admin/KycManagement';
import UserManagement from '@/components/admin/UserManagement';
import AdManagement from '@/components/admin/AdManagement';
import SystemLogs from '@/components/admin/SystemLogs';
import AdManagementPage from '@/pages/AdManagementPage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import InquiryDetailsPage from '@/pages/InquiryDetailsPage';


const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
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
        element: <Verify />,
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
        path: "/profile/:userId",
        element: <PublicProfilePage />
    },
    {
        path: "/ratedeal/:dealId",
        element: <RateDealPage />
    },
    {
        path: "/payment/:dealId",
        element: <PaymentPage />
    },
    {
        path: "/x",
        element: <StripeOnboardingBanner />
    },
    {
        path: "/inquiry/:id",
        element: <InquiryDetailsPage />
    },

    {
        element: <ProtectedRoute allowedRoles={['user', 'admin']} />,
        children: [
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
                        path: "/profile",
                        element: <ProfilePage />
                    },
                    {
                        path: "/wallet",
                        element: <WalletPage />
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
                        element:  
                        <>
                        <StripeOnboardingBanner />
                        <DealDetailsPage />
                        </>
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
                    },
                    {
                        path: "/inventory/edit/:id",
                        element: <AddInventoryPage />
                    },
                    {
                        path: "/ads",
                        element: <AdManagementPage />
                    },
                    {
                        path: "/inventory/:id",
                        element: <InventoryDetails />
                    }
                ]
            }
        ]
    },
    {
        path: "/admin",
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: "", element: <DashboardOverview /> },
                    { path: "kyc", element: <KycManagement /> },
                    { path: "users", element: <UserManagement /> },
                    { path: "ads", element: <AdManagement /> },
                    { path: "logs", element: <SystemLogs /> },
                ]
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default AppRoutes;