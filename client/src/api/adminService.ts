import api from "./axios";

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  accountStatus: "ACTIVE" | "DEACTIVE";
  isVerified: boolean;
  isKycVerified: boolean;
  createdAt: string;
}

export interface AdminKyc {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  firstName: string;
  lastName: string;
  status: "pending" | "approved" | "rejected";
  documents: {
    aadhaar: { aadhaarNumber: string; aadhaarImage?: string; url?: string };
    pan: { panNumber: string; panImage?: string; url?: string };
  };
  rejectionReason?: string;
  createdAt: string;
}

export const adminService = {
  // KYC Management
  getAllKycs: async () => {
    const res = await api.get("/admin/kycs");
    return res.data;
  },

  reviewKyc: async (userId: string, status: "approved" | "rejected", rejectionReason?: string) => {
    const res = await api.patch(`/admin/kyc/${userId}`, { status, rejectionReason });
    return res.data;
  },

  // User Management
  getUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },

  updateUserStatus: async (userId: string, status: "ACTIVE" | "DEACTIVE") => {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  // Advertisement Management
  updateAdStatus: async (adId: string, status: string, rejectionReason?: string) => {
    const res = await api.patch(`/advertisements/${adId}/status`, { status, rejectionReason });
    return res.data;
  },
};
