import { call, put, takeLatest } from 'redux-saga/effects';
import { stripeService } from '@/api/stripeService';
import {
    initiatePaymentRequest, initiatePaymentSuccess, initiatePaymentFailure,
    fetchOnboardingLinkRequest, fetchOnboardingLinkSuccess, fetchOnboardingLinkFailure,
    buyerConfirmDeliveryRequest, buyerConfirmDeliverySuccess, buyerConfirmDeliveryFailure,
    refundEscrowRequest, refundEscrowSuccess, refundEscrowFailure
} from './paymentSlice';
import { fetchDealByIdRequest } from '../deal/dealSlice';
import { toast } from 'sonner';

function* handleInitiatePayment(action: ReturnType<typeof initiatePaymentRequest>) {
    try {
        console.log(action.payload)
        const data: { clientSecret: string; paymentIntentId: string; } = yield call(stripeService.initiatePayment, action.payload);
        // console.log(data)
        yield put(initiatePaymentSuccess(data));
        // We do NOT toast here because success just means we got the clientSecret to show the Elements modal.
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
        yield put(initiatePaymentFailure(errorMessage));
        toast.error(errorMessage);
    }
}

function* handleFetchOnboardingLink() {
    try {
        const data: { url: string } = yield call(stripeService.onboardUser);
        yield put(fetchOnboardingLinkSuccess(data.url));
        toast.success('Generated onboarding link');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to get onboarding link';
        yield put(fetchOnboardingLinkFailure(errorMessage));
        toast.error(errorMessage);
    }
}

function* handleBuyerConfirmDelivery(action: ReturnType<typeof buyerConfirmDeliveryRequest>) {
    try {
        yield call(stripeService.buyerConfirmDelivery, action.payload.dealId, action.payload.notes);
        yield put(buyerConfirmDeliverySuccess());
        toast.success('Successfully confirmed delivery and released escrow.');
        // Refresh deal details to show updated status
        yield put(fetchDealByIdRequest(action.payload.dealId));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to confirm delivery';
        yield put(buyerConfirmDeliveryFailure(errorMessage));
        toast.error(errorMessage);
    }
}

function* handleRefundEscrow(action: ReturnType<typeof refundEscrowRequest>) {
    try {
        yield call(stripeService.refundEscrow, action.payload);
        yield put(refundEscrowSuccess());
        toast.success('Successfully requested escrow refund.');
        // Refresh deal details
        yield put(fetchDealByIdRequest(action.payload));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to refund escrow';
        yield put(refundEscrowFailure(errorMessage));
        toast.error(errorMessage);
    }
}

export function* paymentSaga() {
    yield takeLatest(initiatePaymentRequest.type, handleInitiatePayment);
    yield takeLatest(fetchOnboardingLinkRequest.type, handleFetchOnboardingLink);
    yield takeLatest(buyerConfirmDeliveryRequest.type, handleBuyerConfirmDelivery);
    yield takeLatest(refundEscrowRequest.type, handleRefundEscrow);
}
