import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    loginRequested,
    loginSucceeded,
    loginFailed,
    registerRequested,
    registerSucceeded,
    registerFailed,
    logout,
    verifyOtpSucceeded,
    verifyOtpFailed,
    resendOtpSucceeded,
    resendOtpFailed,
    resendOtpRequested,
    verifyOtpRequested,
    getProfileRequested,
    getProfileSucceeded,
    getProfileFailed,
} from "./auth.Slice";
import { authService } from "../../api/authService";
import { requestFCMToken } from "../../utils/firebase";
import type { LoginPayload, User, RegisterPayload, VerifyOtpPayload, ResendOtpPayload } from "../../api/authService";

// 🔥 LOGIN WORKER
function* loginWorker(action: PayloadAction<LoginPayload>) {
    try {
        const fcmToken: string | null = yield call(requestFCMToken);
        const loginPayload = { ...action.payload, fcmToken: fcmToken || undefined };
        const user: User = yield call([authService, authService.login], loginPayload);
        yield put(loginSucceeded(user));
    } catch (error: any) {
        // yield put(loginFailed(error.message || "Login failed"));
        yield put(
            loginFailed({
                message: error.message || "Login failed",
                details: error.details,
            })
        );
    }
}

// 🔥 REGISTER WORKER
function* registerWorker(action: PayloadAction<RegisterPayload>) {
    try {
        const fcmToken: string | null = yield call(requestFCMToken);
        const registerPayload = { ...action.payload, fcmToken: fcmToken || undefined };
        const response: { message: string } = yield call(
            [authService, authService.register],
            registerPayload
        );

        yield put(registerSucceeded(response));
    } catch (error: any) {
        yield put(registerFailed(error.message || "Registration failed"));
    }
}

// 🔥 LOGOUT WORKER
function* logoutWorker() {
    try {
        yield call([authService, authService.logout]);
    } catch (error: any) {
        console.error("Logout failed:", error);
    }
}

// 🔥 VERIFY OTP WORKER
function* verifyOtpWorker(action: PayloadAction<VerifyOtpPayload>) {
    try {

        const result: { user: User; message: string } = yield call([authService, authService.verifyOtp], action.payload);

        yield put(verifyOtpSucceeded(result));

    } catch (error: any) {
        yield put(verifyOtpFailed(error.message || "OTP verification failed"));
    }
}

// 🔥 RESEND OTP WORKER
function* resendOtpWorker(action: PayloadAction<ResendOtpPayload>) {
    try {
        yield call([authService, authService.resendOtp], action.payload);
        yield put(resendOtpSucceeded("OTP has been resent to your email address"));
    } catch (error: any) {
        yield put(resendOtpFailed(error.message || "Failed to resend OTP"));
    }
}

// 🔥 GET PROFILE WORKER
function* getProfileWorker() {
    try {
        const user: User = yield call([authService, authService.getProfile]);
        yield put(getProfileSucceeded(user));
    } catch (error: any) {
        yield put(getProfileFailed({
            message: error.message || "Failed to fetch profile",
            details: error.details
        }));
    }
}


// 👂 WATCHER SAGA
export function* authSaga() {
    yield takeLatest(loginRequested.type, loginWorker);
    yield takeLatest(registerRequested.type, registerWorker);
    yield takeLatest(logout.type, logoutWorker);
    yield takeLatest(verifyOtpRequested.type, verifyOtpWorker);
    yield takeLatest(resendOtpRequested.type, resendOtpWorker);
    yield takeLatest(getProfileRequested.type, getProfileWorker);
}