import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { KycData, SubmitKycPayload } from "../../api/kycService";

type RequestStatus = "idle" | "loading" | "success" | "error";

interface ApiError {
  message: string;
  details?: string;
}

interface AsyncState {
  status: RequestStatus;
  error: ApiError | null;
  message: string | null;
}

interface KycState {
  kyc: KycData | null;

  submit: AsyncState;
  fetch: AsyncState;
  update: AsyncState;
}

const initialState: KycState = {
  kyc: null,

  submit: { status: "idle", error: null, message: null },
  fetch: { status: "idle", error: null, message: null },
  update: { status: "idle", error: null, message: null },
};

const kycSlice = createSlice({
  name: "kyc",
  initialState,
  reducers: {
    // SUBMIT KYC
    submitKycRequested(state, action: PayloadAction<SubmitKycPayload>) {
      state.submit.status = "loading";
      state.submit.error = null;
      state.submit.message = null;
    },
    submitKycSucceeded(state, action: PayloadAction<{ kyc: KycData; message: string }>) {
      state.submit.status = "success";
      state.submit.message = action.payload.message;
      state.kyc = action.payload.kyc;
    },
    submitKycFailed(state, action: PayloadAction<ApiError>) {
      state.submit.status = "error";
      state.submit.error = action.payload;
    },

    // FETCH KYC
    fetchKycRequested(state) {
      state.fetch.status = "loading";
      state.fetch.error = null;
      state.fetch.message = null;
    },
    fetchKycSucceeded(state, action: PayloadAction<KycData>) {
      state.fetch.status = "success";
      state.kyc = action.payload;
    },
    fetchKycFailed(state, action: PayloadAction<ApiError>) {
      state.fetch.status = "error";
      state.fetch.error = action.payload;
    },

    // UPDATE KYC
    updateKycRequested(state) {
      state.update.status = "loading";
      state.update.error = null;
      state.update.message = null;
    },
    updateKycSucceeded(state, action: PayloadAction<{ kyc: KycData; message: string }>) {
      state.update.status = "success";
      state.update.message = action.payload.message;
      state.kyc = action.payload.kyc;
    },
    updateKycFailed(state, action: PayloadAction<ApiError>) {
      state.update.status = "error";
      state.update.error = action.payload;
    },

    // CLEAR STATES
    clearSubmitState(state) {
      state.submit = { status: "idle", error: null, message: null };
    },

    clearFetchState(state) {
      state.fetch = { status: "idle", error: null, message: null };
    },

    clearUpdateState(state) {
      state.update = { status: "idle", error: null, message: null };
    },

    // RESET KYC
    resetKyc(state) {
      state.kyc = null;
    },
  },
});

export const {
  submitKycRequested,
  submitKycSucceeded,
  submitKycFailed,
  fetchKycRequested,
  fetchKycSucceeded,
  fetchKycFailed,
  updateKycRequested,
  updateKycSucceeded,
  updateKycFailed,
  clearSubmitState,
  clearFetchState,
  clearUpdateState,
  resetKyc,
} = kycSlice.actions;

export default kycSlice.reducer;
