import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Notification } from "../../types/notification";

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    total: number;
    page: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    total: 0,
    page: 1,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        fetchNotificationsStart: (state, _action: PayloadAction<{ page?: number; limit?: number } | undefined>) => {
            state.loading = true;
            state.error = null;
        },
        fetchNotificationsSuccess: (state, action: PayloadAction<{ notifications: Notification[]; total: number; page: number }>) => {
            state.loading = false;
            state.notifications = action.payload.page === 1 
                ? action.payload.notifications 
                : [...state.notifications, ...action.payload.notifications];
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        },
        fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
            state.total += 1;
        },
        markReadRequest: (state, _action: PayloadAction<string>) => {
            // Optimistic update could be here
        },
        markReadSuccess: (state, action: PayloadAction<string>) => {
            const index = state.notifications.findIndex(n => n._id === action.payload);
            if (index !== -1 && !state.notifications[index].isRead) {
                state.notifications[index].isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllReadRequest: (state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        },
        markAllReadSuccess: (state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        },
    },
});

export const {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    addNotification,
    markReadRequest,
    markReadSuccess,
    markAllReadRequest,
    markAllReadSuccess,
} = notificationSlice.actions;

export default notificationSlice.reducer;
