import api from "./axios";
import type { SubmitAuctionPayload, Auction } from "../types/auction";




function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}


export const auctionService = {
    createAuction: async (inventoryId: string, data: SubmitAuctionPayload): Promise<Auction> => {
        const response = await api.post(`/auction/${inventoryId}`, data, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    getAuctions: async (params?: Record<string, any>): Promise<Auction[]> => {
        const response = await api.get("/auction", {
            headers: authHeaders(),
            params,
        });
        return response.data.data;
    },

    getAuctionById: async (auctionId: string): Promise<Auction> => {
        const response = await api.get(`/auction/${auctionId}`, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    updateAuction: async (auctionId: string, data: Partial<SubmitAuctionPayload>): Promise<Auction> => {
        const response = await api.put(`/auction/${auctionId}`, data, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    deleteAuction: async (auctionId: string): Promise<void> => {
        await api.delete(`/auction/${auctionId}`, {
            headers: authHeaders(),
        });
    }
};
