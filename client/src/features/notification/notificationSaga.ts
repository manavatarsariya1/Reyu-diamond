import { call, put, takeLatest, all } from "redux-saga/effects";
import { notificationService } from "../../api/notificationService";
import {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    markReadRequest,
    markReadSuccess,
    markAllReadRequest,
    markAllReadSuccess,
} from "./notificationSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { NotificationResponse } from "../../types/notification";

function* handleFetchNotifications(action: PayloadAction<{ page?: number; limit?: number } | undefined>) {
    try {
        const { page = 1, limit = 20 } = action.payload || {};
        const response: NotificationResponse = yield call(notificationService.getNotifications, page, limit);
        yield put(fetchNotificationsSuccess({
            notifications: response.notifications,
            total: response.pagination.total,
            page: response.pagination.page,
        }));
    } catch (error: any) {
        yield put(fetchNotificationsFailure(error.message || "Failed to fetch notifications"));
    }
}

function* handleMarkRead(action: PayloadAction<string>) {
    try {
        yield call(notificationService.markAsRead, action.payload);
        yield put(markReadSuccess(action.payload));
    } catch (error: any) {
        console.error("Failed to mark notification as read", error);
    }
}

function* handleMarkAllRead() {
    try {
        yield call(notificationService.markAllAsRead);
        yield put(markAllReadSuccess());
    } catch (error: any) {
        console.error("Failed to mark all notifications as read", error);
    }
}

export function* notificationSaga() {
    yield all([
        takeLatest(fetchNotificationsStart.type, handleFetchNotifications),
        takeLatest(markReadRequest.type, handleMarkRead),
        takeLatest(markAllReadRequest.type, handleMarkAllRead),
    ]);
}
