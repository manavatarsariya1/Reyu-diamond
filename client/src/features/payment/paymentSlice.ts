import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PaymentState {
    clientSecret: string | null;
    paymentIntentId: string | null;
    isProcessing: boolean;
    error: string | null;
    success: boolean;
    onboardingUrl: string | null;
    status: string | null;
}

const initialState: PaymentState = {
    clientSecret: null,
    paymentIntentId: null,
    isProcessing: false,
    error: null,
    success: false,
    onboardingUrl: null,
    status: null,
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        // Initiate Payment
        initiatePaymentRequest: (state, _action: PayloadAction<string>) => {
            state.isProcessing = true;
            state.error = null;
            state.clientSecret = null;
            state.paymentIntentId = null;
        },
        initiatePaymentSuccess: (state, action: PayloadAction<{ clientSecret: string; paymentIntentId: string; status?: string }>) => {
            state.isProcessing = false;
            state.clientSecret = action.payload.clientSecret;
            state.paymentIntentId = action.payload.paymentIntentId;
            state.status = action.payload.status || null;
        },
        initiatePaymentFailure: (state, action: PayloadAction<string>) => {
            state.isProcessing = false;
            state.error = action.payload;
        },

        // Onboarding
        fetchOnboardingLinkRequest: (state) => {
            state.isProcessing = true;
            state.error = null;
            state.onboardingUrl = null;
        },
        fetchOnboardingLinkSuccess: (state, action: PayloadAction<string>) => {
            state.isProcessing = false;
            state.onboardingUrl = action.payload;
        },
        fetchOnboardingLinkFailure: (state, action: PayloadAction<string>) => {
            state.isProcessing = false;
            state.error = action.payload;
        },

        // Buyer Confirm Delivery
        buyerConfirmDeliveryRequest: (state, _action: PayloadAction<{ dealId: string; notes?: string }>) => {
            state.isProcessing = true;
            state.error = null;
            state.success = false;
        },
        buyerConfirmDeliverySuccess: (state) => {
            state.isProcessing = false;
            state.success = true;
        },
        buyerConfirmDeliveryFailure: (state, action: PayloadAction<string>) => {
            state.isProcessing = false;
            state.error = action.payload;
        },

        // Refund Escrow
        refundEscrowRequest: (state, _action: PayloadAction<string>) => {
            state.isProcessing = true;
            state.error = null;
            state.success = false;
        },
        refundEscrowSuccess: (state) => {
            state.isProcessing = false;
            state.success = true;
        },
        refundEscrowFailure: (state, action: PayloadAction<string>) => {
            state.isProcessing = false;
            state.error = action.payload;
        },

        // General state reset
        resetPaymentState: (state) => {
            state.error = null;
            state.success = false;
            state.isProcessing = false;
            state.clientSecret = null;
            state.paymentIntentId = null;
            state.onboardingUrl = null;
            state.status = null;
        }
    }
});

export const {
    initiatePaymentRequest,
    initiatePaymentSuccess,
    initiatePaymentFailure,
    fetchOnboardingLinkRequest,
    fetchOnboardingLinkSuccess,
    fetchOnboardingLinkFailure,
    buyerConfirmDeliveryRequest,
    buyerConfirmDeliverySuccess,
    buyerConfirmDeliveryFailure,
    refundEscrowRequest,
    refundEscrowSuccess,
    refundEscrowFailure,
    resetPaymentState
} = paymentSlice.actions;

export default paymentSlice.reducer;
