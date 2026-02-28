import api from "./axios";
import type { Bid, CreateBidPayload, BidStatus } from "../types/bid";

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export const bidService = {
    createBid: async (auctionId: string, payload: CreateBidPayload): Promise<Bid> => {
        const response = await api.post(`/bid/${auctionId}`, payload, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    getAllBids: async (auctionId: string): Promise<Bid[]> => {
        const response = await api.get(`/bid/${auctionId}`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    getAllMyBids: async (): Promise<any[]> => {
        const response = await api.get(`/bid/user/my-bids`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    getMyBid: async (auctionId: string): Promise<Bid> => {
        const response = await api.get(`/bid/${auctionId}/my-bid`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    updateBidStatus: async (bidId: string, status: BidStatus): Promise<Bid> => {
        const response = await api.patch(
            `/bid/${bidId}/status`,
            { status },
            {
                headers: authHeaders()
            }
        );
        return response.data.data;
    }
};
