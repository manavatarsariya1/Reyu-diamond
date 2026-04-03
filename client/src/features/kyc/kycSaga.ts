import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  submitKycRequested,
  submitKycSucceeded,
  submitKycFailed,
  fetchKycRequested,
  fetchKycSucceeded,
  fetchKycFailed,
  fetchKycStatusRequested,
  fetchKycStatusFailed,
  fetchKycStatusSucceeded,
  // updateKycRequested,
  // updateKycSucceeded,
  // updateKycFailed,
} from "./kycSlice";

import { fetchKycStatus, submitKyc, } from "../../api/kycService";
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

function* fetchKycStatusSaga(action: PayloadAction<string>) {
  try {
    const res: any = yield call(fetchKycStatus, action.payload);
    console.log(res, "rers")
    yield put(fetchKycStatusSucceeded(res.data)); // res.data = { status, rejectionReason? }
  } catch (err: any) {
    yield put(fetchKycStatusFailed({ message: err?.response?.data?.message || err.message }));
  }
}

export default function* kycWatcherSaga() {
  yield takeLatest(submitKycRequested.type, submitKycSaga);
  yield takeLatest(fetchKycStatusRequested.type, fetchKycStatusSaga)
}
