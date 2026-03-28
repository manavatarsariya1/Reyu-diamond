import api from "./axios";

export interface Advertisement {
    _id: string;
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    ctaLink?: string;
    bannerSection: string[];
    status: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";
    advertiserId: any;
    inventoryId?: any;
    createdAt: string;
}

export const adService = {
    getActiveAdvertisements: async (section?: string) => {
        const res = await api.get("/advertisements/active", { params: { section } });
        return res.data;
    },

    getMyAdvertisements: async () => {
        const res = await api.get("/advertisements");
        return res.data;
    },

    createAdvertisement: async (formData: FormData) => {
        const res = await api.post("/advertisements", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },

    deleteAdvertisement: async (id: string) => {
        const res = await api.delete(`/advertisements/${id}`);
        return res.data;
    }
};
