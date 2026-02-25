import { call, put, takeLatest } from "redux-saga/effects";
import { preferenceService } from "@/api/preferenceService";
import type { SubmitPreferencePayload } from "@/api/preferenceService";
import * as actions from "./preferenceSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import type { DiamondPreference } from "@/types/preference";

// Worker Sagas
function* fetchMyRequirementsSaga() {
    try {
        const data: DiamondPreference[] = yield call([preferenceService, preferenceService.fetchMyRequirements]);
        yield put(actions.fetchMyRequirementsSuccess(data));
    } catch (error: any) {
        const message = error.message || "Failed to fetch preferences";
        yield put(actions.fetchMyRequirementsFailure(message));
        toast.error(message);
    }
}

function* submitPreferenceSaga(action: PayloadAction<SubmitPreferencePayload>) {
    try {
        const data: DiamondPreference = yield call([preferenceService, preferenceService.submitPreference], action.payload);
        yield put(actions.submitPreferenceSuccess(data));
        toast.success("Preference created successfully");
    } catch (error: any) {
        const message = error.message || "Failed to create preference";
        yield put(actions.submitPreferenceFailure(message));
        toast.error(message);
    }
}

function* updatePreferenceSaga(action: PayloadAction<{ id: string; payload: Partial<SubmitPreferencePayload> }>) {
    try {
        const data: DiamondPreference = yield call(
            [preferenceService, preferenceService.updatePreference],
            action.payload.id,
            action.payload.payload
        );
        yield put(actions.updatePreferenceSuccess(data));
        toast.success("Preference updated successfully");
    } catch (error: any) {
        const message = error.message || "Failed to update preference";
        yield put(actions.updatePreferenceFailure(message));
        toast.error(message);
    }
}

function* deletePreferenceSaga(action: PayloadAction<string>) {
    try {
        yield call([preferenceService, preferenceService.deletePreference], action.payload);
        yield put(actions.deletePreferenceSuccess(action.payload));
        toast.success("Preference deleted successfully");
    } catch (error: any) {
        const message = error.message || "Failed to delete preference";
        yield put(actions.deletePreferenceFailure(message));
        toast.error(message);
    }
}

// Watcher Saga
export function* preferenceWatcherSaga() {
    yield takeLatest(actions.fetchMyRequirementsStart.type, fetchMyRequirementsSaga);
    yield takeLatest(actions.submitPreferenceStart.type, submitPreferenceSaga);
    yield takeLatest(actions.updatePreferenceStart.type, updatePreferenceSaga);
    yield takeLatest(actions.deletePreferenceStart.type, deletePreferenceSaga);
}

export default preferenceWatcherSaga;
