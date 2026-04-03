import api from "./axios";

export interface Requirement {
    _id: string;
    userId: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    lab: string;
    location: string;
    budget: number;
    createdAt: string;
    updatedAt: string;
}

function getToken() {
    try {
        return JSON.parse(localStorage.getItem("token") || "\"\"");
    } catch {
        return "";
    }
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const requirementService = {
    // Protected: Get user's own requirements
    getMyRequirements: async (): Promise<Requirement[]> => {
        const response = await api.get("/requirements/my-requirement", {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    // Protected: Create a new requirement
    createRequirement: async (data: Partial<Requirement>): Promise<Requirement> => {
        const response = await api.post("/requirements", data, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    // Public: Get requirement details for sharing
    getPublicRequirement: async (id: string): Promise<Requirement> => {
        const response = await api.get(`/requirements/share/${id}`);
        return response.data.data;
    },
};
