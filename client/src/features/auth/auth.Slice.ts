import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { User, LoginPayload, RegisterPayload, VerifyOtpPayload, ResendOtpPayload } from "../../api/authService";

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

interface AuthState {
  user: User | null;

  login: AsyncState;
  register: AsyncState;
  otp: AsyncState;
  resendOtp: AsyncState;
}

const initialState: AuthState = {
  user: null,

  login: { status: "idle", error: null, message: null },
  register: { status: "idle", error: null, message: null },
  otp: { status: "idle", error: null, message: null },
  resendOtp: { status: "idle", error: null, message: null },
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGIN
    loginRequested(state, action: PayloadAction<LoginPayload>) {
      state.login.status = "loading";
      state.login.error = null;
      state.login.message = null;
    },
    loginSucceeded(state, action: PayloadAction<User>) {
      state.login.status = "success";
      state.login.message = "Login successful";
      state.user = action.payload;
    },
    loginFailed(state, action: PayloadAction<ApiError>) {
      state.login.status = "error";
      state.login.error = action.payload;
    },

    // REGISTER
    registerRequested(state) {
      state.register.status = "loading";
      state.register.error = null;
      state.register.message = null;
    },
    registerSucceeded(state, action: PayloadAction<{ message: string }>) {
      state.register.status = "success";
       state.register.message = action.payload.message;
    },
    registerFailed(state, action: PayloadAction<ApiError>) {
      state.register.status = "error";
      state.register.error = action.payload;
    },

    // VERIFY OTP
    verifyOtpRequested(state) {
      state.otp.status = "loading";
      state.otp.error = null;
      state.otp.message = null;
    },
    verifyOtpSucceeded(state, action: PayloadAction<{ user: User; message: string }>) {
      state.otp.status = "success";
      state.otp.message = action.payload.message;
      state.user = action.payload.user;
    },
    verifyOtpFailed(state, action: PayloadAction<ApiError>) {
      state.otp.status = "error";
      state.otp.error = action.payload;
    },

    // RESEND OTP
    resendOtpRequested(state) {
      state.resendOtp.status = "loading";
      state.resendOtp.error = null;
      state.resendOtp.message = null;
    },
    resendOtpSucceeded(state, action: PayloadAction<string>) {
      state.resendOtp.status = "success";
      state.resendOtp.message = action.payload;
    },
    resendOtpFailed(state, action: PayloadAction<ApiError>) {
      state.resendOtp.status = "error";
      state.resendOtp.error = action.payload;
    },



    // LOGOUT
    logout(state) {
      state.user = null;
      state.login = { status: "idle", error: null, message: null };
      state.register = { status: "idle", error: null, message: null };
      state.otp = { status: "idle", error: null, message: null };
      state.resendOtp = { status: "idle", error: null, message: null };
    },

    clearResendOtpState(state) {
      state.resendOtp = { status: "idle", message: null, error: null };
    },

    clearOtpState(state) {
      state.otp = { status: "idle", message: null, error: null };
    },

    clearRegisterState(state) {
      state.register = { status: "idle", message: null, error: null };
    },

    clearLoginState(state) {
      state.login = { status: "idle", message: null, error: null };
    },

    // CLEAR ERROR
    // clearError(state) {
    //   state.error = null;
    // },

    // // CLEAR RESEND SUCCESS
    // clearResendSuccess(state) {
    //   state.resendSuccess = false;
    // },
  },
});

export const {
  loginRequested,
  loginSucceeded,
  loginFailed,
  registerRequested,
  registerSucceeded,
  registerFailed,
  verifyOtpRequested,
  verifyOtpSucceeded,
  verifyOtpFailed,
  resendOtpRequested,
  resendOtpSucceeded,
  resendOtpFailed,
  logout,
  clearResendOtpState,
  clearOtpState,
  clearRegisterState,
  clearLoginState
  // clearError,
  // clearResendSuccess,
} = authSlice.actions;

export default authSlice.reducer;