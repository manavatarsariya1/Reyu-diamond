import { call, put, takeLatest } from "redux-saga/effects";
import { adminService } from "../../api/adminService";
import { analyticsService } from "../../api/analyticsService";
import {
    fetchStatsStart,
    fetchStatsSuccess,
    fetchStatsFailure,
    fetchUsersStart,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchKycsStart,
    fetchKycsSuccess,
    fetchKycsFailure,
} from "./adminSlice";

// Workers
function* fetchStatsWorker() {
    try {
        const response: { data: any } = yield call(analyticsService.getDashboardStats);
        yield put(fetchStatsSuccess(response.data));
    } catch (error: any) {
        yield put(fetchStatsFailure(error.message));
    }
}

function* fetchUsersWorker() {
    try {
        const response: { data: { users: any[] } } = yield call(adminService.getUsers);
        yield put(fetchUsersSuccess(response.data.users));
    } catch (error: any) {
        yield put(fetchUsersFailure(error.message));
    }
}

function* fetchKycsWorker() {
    try {
        const response: { data: { kycRecords: any[] } } = yield call(adminService.getAllKycs);
        yield put(fetchKycsSuccess(response.data.kycRecords));
    } catch (error: any) {
        yield put(fetchKycsFailure(error.message));
    }
}

// Watcher
export function* adminSaga() {
    yield takeLatest(fetchStatsStart.type, fetchStatsWorker);
    yield takeLatest(fetchUsersStart.type, fetchUsersWorker);
    yield takeLatest(fetchKycsStart.type, fetchKycsWorker);
}
