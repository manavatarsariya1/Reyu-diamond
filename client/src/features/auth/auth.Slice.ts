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
  isProcessing: boolean;

  login: AsyncState;
  register: AsyncState;
  otp: AsyncState;
  resendOtp: AsyncState;
  profile: AsyncState;
}

const initialState: AuthState = {
  user: null,
  isProcessing: false,

  login: { status: "idle", error: null, message: null },
  register: { status: "idle", error: null, message: null },
  otp: { status: "idle", error: null, message: null },
  resendOtp: { status: "idle", error: null, message: null },
  profile: { status: "idle", error: null, message: null },
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGIN
    loginRequested(state, _action: PayloadAction<LoginPayload>) {
      state.login.status = "loading";
      state.isProcessing = true;
      state.login.error = null;
      state.login.message = null;
    },
    loginSucceeded(state, action: PayloadAction<User>) {
      state.login.status = "success";
      state.isProcessing = false;
      state.login.message = "Login successful";
      state.user = action.payload;
    },
    loginFailed(state, action: PayloadAction<ApiError>) {
      state.login.status = "error";
      state.isProcessing = false;
      state.login.error = action.payload;
    },

    // REGISTER
    registerRequested(state, _action: PayloadAction<RegisterPayload>) {
      state.register.status = "loading";
      state.isProcessing = true;
      state.register.error = null;
      state.register.message = null;
    },
    registerSucceeded(state, action: PayloadAction<{ message: string }>) {
      state.register.status = "success";
      state.isProcessing = false;
       state.register.message = action.payload.message;
    },
    registerFailed(state, action: PayloadAction<ApiError>) {
      state.register.status = "error";
      state.isProcessing = false;
      state.register.error = action.payload;
    },

    // VERIFY OTP
    verifyOtpRequested(state, _action: PayloadAction<VerifyOtpPayload>) {
      state.otp.status = "loading";
      state.isProcessing = true;
      state.otp.error = null;
      state.otp.message = null;
    },
    verifyOtpSucceeded(state, action: PayloadAction<{ user: User; message: string }>) {
      state.otp.status = "success";
      state.isProcessing = false;
      state.otp.message = action.payload.message;
      state.user = action.payload.user;
    },
    verifyOtpFailed(state, action: PayloadAction<ApiError>) {
      state.otp.status = "error";
      state.isProcessing = false;
      state.otp.error = action.payload;
    },

    // RESEND OTP
    resendOtpRequested(state, _action: PayloadAction<ResendOtpPayload>) {
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

    // GET PROFILE
    getProfileRequested(state) {
      if (!state.profile) {
        state.profile = { status: "idle", error: null, message: null };
      }
      state.profile.status = "loading";
      state.profile.error = null;
    },
    getProfileSucceeded(state, action: PayloadAction<User>) {
      if (!state.profile) {
        state.profile = { status: "idle", error: null, message: null };
      }
      state.profile.status = "success";
      state.user = action.payload;
    },
    getProfileFailed(state, action: PayloadAction<ApiError>) {
      if (!state.profile) {
        state.profile = { status: "idle", error: null, message: null };
      }
      state.profile.status = "error";
      state.profile.error = action.payload;
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
  getProfileRequested,
  getProfileSucceeded,
  getProfileFailed,
  logout,
  clearResendOtpState,
  clearOtpState,
  clearRegisterState,
  clearLoginState
  // clearError,
  // clearResendSuccess,
} = authSlice.actions;

export default authSlice.reducer;