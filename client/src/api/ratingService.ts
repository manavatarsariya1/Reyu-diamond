import api from "./axios";
import type { Reputation } from "@/types/rating";

export const ratingService = {
    /**
     * Submit a new rating for a completed deal
     */
    createRating: async (dealId: string, score: number, feedback?: string) => {
        const res = await api.post("/ratings", { dealId, score, feedback });
        return res.data;
    },

    /**
     * Get all ratings targeted at a specific user
     */
    getUserRatings: async (userId: string) => {
        const res = await api.get(`/ratings/user/${userId}`);
        return res.data;
    },

    /**
     * Get comprehensive reputation metrics for a user
     */
    getUserReputation: async (userId: string): Promise<{ success: boolean; data: Reputation }> => {
        const res = await api.get(`/ratings/reputation/${userId}`);
        return res.data;
    },

    /**
     * Check if the current user has already rated a specific deal
     */
    checkRating: async (dealId: string): Promise<{ success: boolean; rated: boolean; rating: any }> => {
        const res = await api.get(`/ratings/check/${dealId}`);
        return res.data;
    }
};
