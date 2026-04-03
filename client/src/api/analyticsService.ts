import api from "./axios";

export interface DashboardStats {
  totalUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  pendingKyc: number;
  pendingAds: number;
}

export const analyticsService = {
  getDashboardStats: async () => {
    const res = await api.get("/analytics/dashboard");
    return res.data;
  },

  getRevenueAnalytics: async () => {
    const res = await api.get("/analytics/revenue");
    return res.data;
  },

  getSystemLogs: async (params?: { page?: number; limit?: number; severity?: string }) => {
    const res = await api.get("/logs/system", { params });
    return res.data;
  },

  getAdminLogs: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get("/logs/admin", { params });
    return res.data;
  },

  getSystemStats: async () => {
    const res = await api.get("/logs/system/stats");
    return res.data;
  },
  
  getUserDashboardStats: async () => {
    const res = await api.get("/analytics/user/dashboard");
    return res.data;
  },
};
