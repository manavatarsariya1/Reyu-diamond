import axiosInstance from './axios';
import type { Deal, DealStatus } from '@/types/deal';


function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export const dealService = {
    /**
     * Create a new deal from an accepted bid
     */
    createDeal: async (bidId: string): Promise<Deal> => {
        const response = await axiosInstance.post<{ success: boolean; data: Deal }>(`/deal/${bidId}`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Create a deal directly via Buy-It-Now base price (bypassing normal bidding).
     */
    createDirectDeal: async (auctionId: string): Promise<Deal> => {
        const response = await axiosInstance.post<{ success: boolean; data: Deal }>(`/deal/direct/${auctionId}`, {}, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Get deal details by ID
     */
    getDealById: async (dealId: string): Promise<Deal> => {
        const response = await axiosInstance.get<{ success: boolean; data: Deal }>(`/deal/${dealId}`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Get all deals for the current user
     */
    getAllDeals: async (): Promise<Deal[]> => {
        const response = await axiosInstance.get<{ success: boolean; data: { deals: Deal[], total: number, pages: number } }>('/deal', {
            headers: authHeaders()
        });
        return response.data.data.deals;
    },

    /**
     * Update deal status
     */
    updateDealStatus: async (
        dealId: string,
        payload: {
            status: DealStatus;
            payment?: any;
            shipping?: any;
        }
    ): Promise<Deal> => {
        const response = await axiosInstance.patch<{ success: boolean; data: Deal }>(`/deal/${dealId}`, payload, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Cancel a deal
     */
    cancelDeal: async (dealId: string, reason: string): Promise<Deal> => {
        const response = await axiosInstance.patch<{ success: boolean; data: Deal }>(`/deal/${dealId}/cancel`, { reason }, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Raise a dispute on a deal
     */
    raiseDispute: async (dealId: string, reason: string): Promise<Deal> => {
        const response = await axiosInstance.patch<{ success: boolean; data: Deal }>(`/deal/${dealId}/dispute`, { reason }, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Download Deal PDF Invoice
     */
    downloadPDF: async (dealId: string): Promise<Blob> => {
        const response = await axiosInstance.post(`/deal/${dealId}/pdf`, {}, {
            responseType: 'blob',
            headers: authHeaders()
        });
        return response.data;
    }
};
