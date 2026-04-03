import api from "./axios";
import type { NotificationResponse, Notification } from "../types/notification";

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export const notificationService = {
    getNotifications: async (page = 1, limit = 20): Promise<NotificationResponse> => {
        const response = await api.get(`/notifications?page=${page}&limit=${limit}`, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    markAsRead: async (notificationId: string): Promise<Notification> => {
        const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
            headers: authHeaders(),
        });
        return response.data.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.patch("/notifications/read-all", {}, {
            headers: authHeaders(),
        });
    },
};
