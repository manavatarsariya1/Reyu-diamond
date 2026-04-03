import api from "./axios";
import type { InventoryItem } from "@/types/inventory";

export interface SubmitInventoryPayload {
    title: string;
    description?: string;
    barcode: string;
    carat: number;
    cut: string;
    color: string;
    clarity: string;
    shape: string;
    lab: string;
    location: string;
    price: number;
    currency: string;
    status: string;
    images?: File[];
    video?: File;
}

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}


export const inventoryService = {


    fetchInventories: async (filters: any = {}): Promise<InventoryItem[]> => {
        const response = await api.get("/inventory", {
            params: filters,
            headers: authHeaders(),
        });
        return response.data.data;
    },

    getInventoryById: async (id: string): Promise<InventoryItem> => {
        const response = await api.get(`/inventory/${id}`, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    createInventory: async (data: FormData): Promise<InventoryItem> => {
        // Axios handles multipart/form-data boundary automatically when passing FormData
        const response = await api.post("/inventory", data, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    updateInventory: async (id: string, data: Partial<SubmitInventoryPayload>): Promise<InventoryItem> => {
        const response = await api.put(`/inventory/${id}`, data, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    deleteInventory: async (id: string): Promise<void> => {
        await api.delete(`/inventory/${id}`, {
            headers: authHeaders(),
        });
    }
};
