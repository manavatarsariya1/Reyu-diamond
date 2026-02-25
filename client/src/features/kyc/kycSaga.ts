import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  submitKycRequested,
  submitKycSucceeded,
  submitKycFailed,
  fetchKycRequested,
  fetchKycSucceeded,
  fetchKycFailed,
  updateKycRequested,
  updateKycSucceeded,
  updateKycFailed,
} from "./kycSlice";

import { submitKyc, fetchKyc } from "../../api/kycService";
import type { SubmitKycPayload } from "../../api/kycService";

function* submitKycSaga(action: PayloadAction<SubmitKycPayload>): any {
  try {
    const response = yield call(submitKyc, action.payload);
    yield put(submitKycSucceeded(response));
  } catch (error: any) {
    yield put(
      submitKycFailed({
        message: error.response?.data?.message || "Submit failed",
      })
    );
  }
}

function* fetchKycSaga(): any {
  try {
    const response = yield call(fetchKyc);
    yield put(fetchKycSucceeded(response));
  } catch (error: any) {
    yield put(
      fetchKycFailed({
        message: error.response?.data?.message || "Fetch failed",
      })
    );
  }
}

function* updateKycSaga(action: PayloadAction<SubmitKycPayload>): any {
  try {
    const response = yield call(updateKyc, action.payload);
    yield put(updateKycSucceeded(response));
  } catch (error: any) {
    yield put(
      updateKycFailed({
        message: error.response?.data?.message || "Update failed",
      })
    );
  }
}

export default function* kycWatcherSaga() {
  yield takeLatest(submitKycRequested.type, submitKycSaga);
  yield takeLatest(fetchKycRequested.type, fetchKycSaga);
  yield takeLatest(updateKycRequested.type, updateKycSaga);
}
