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
} from "./auth.Slice";
import { authService } from "../../api/authService";
import type { LoginPayload, User, RegisterPayload } from "../../api/authService";

// 🔥 LOGIN WORKER
function* loginWorker(action: PayloadAction<LoginPayload>) {
    try {
        console.log(action.payload)

        // Direct call on instance → array not needed
        // Passing method as reference (Redux-Saga, setTimeout, event handler) → always use [instance, method]

        //  authService.login(action.payload) remember context of this (their father) key word  (dont meed array)

        //  authService.login  direct contact with login method by doing this, loose the context ,   i have to tell them by passing their context(papa) like this is your father or context so for that syntext is [authService, authService.login]  authService is your father or context remember them after contact with login method in class

        const user: User = yield call([authService, authService.login], action.payload);
        yield put(loginSucceeded(user));
    } catch (error: any) {
        yield put(loginFailed(error.message || "Login failed"));
    }
}

// 🔥 REGISTER WORKER
function* registerWorker(action: PayloadAction<RegisterPayload>) {
    try {
        const user: User = yield call([authService, authService.register], action.payload);
        // console.log("Saga received user:", user);
        yield put(registerSucceeded(user));
    } catch (error: any) {
        yield put(registerFailed(error.message || "Registration failed"));
    }
}

// 🔥 LOGOUT WORKER
function* logoutWorker() {
    yield call([authService, authService.logout]);
}

// 👂 WATCHER SAGA
export function* authSaga() {
    yield takeLatest(loginRequested.type, loginWorker);
    yield takeLatest(registerRequested.type, registerWorker);
    yield takeLatest(logout.type, logoutWorker);
}
