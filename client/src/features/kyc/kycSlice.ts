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
  fetchStatus: AsyncState & { kycStatus: KycData["status"] | null; rejectionReason?: string };
}

const initialState: KycState = {
  kyc: null,
  submit: { status: "idle", error: null, message: null },
  fetch: { status: "idle", error: null, message: null },
  fetchStatus: {
    status: "idle",
    error: null,
    message: null,
    kycStatus: null,
    rejectionReason: undefined
  },
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

    fetchKycStatusRequested(state, action: PayloadAction<string>) {  // add PayloadAction<string>
      state.fetchStatus.status = "loading";
      state.fetchStatus.error = null;
    },
    fetchKycStatusSucceeded(state, action: PayloadAction<{ status: KycData["status"]; rejectionReason?: string }>) {
      state.fetchStatus.status = "success";
      state.fetchStatus.kycStatus = action.payload.status;
      state.fetchStatus.rejectionReason = action.payload.rejectionReason;
    },
    fetchKycStatusFailed(state, action: PayloadAction<ApiError>) {
      state.fetchStatus.status = "error";
      state.fetchStatus.error = action.payload;
    },

    // CLEAR STATES
    clearSubmitState(state) {
      state.submit = { status: "idle", error: null, message: null };
    },

    clearFetchState(state) {
      state.fetch = { status: "idle", error: null, message: null };
    },

    clearfetchKycState(state) {
      state.fetchStatus = { status: "idle", error: null, message: null, kycStatus: null, rejectionReason: undefined }
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
  fetchKycStatusRequested,
  fetchKycStatusSucceeded,
  fetchKycStatusFailed,
  clearSubmitState,
  clearFetchState,
  clearfetchKycState,
  resetKyc,
} = kycSlice.actions;

export default kycSlice.reducer;
