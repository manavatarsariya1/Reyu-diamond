import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dealService } from '@/api/dealService';
import type { Deal, DealStatus } from '@/types/deal';
import { toast } from 'sonner';

import {
    fetchAllDealsRequest,
    fetchAllDealsSuccess,
    fetchAllDealsFailure,
    fetchDealByIdRequest,
    fetchDealByIdSuccess,
    fetchDealByIdFailure,
    createDealRequest,
    createDealSuccess,
    createDealFailure,
    createDirectDealRequest,
    createDirectDealSuccess,
    createDirectDealFailure,
    updateDealStatusRequest,
    updateDealStatusSuccess,
    updateDealStatusFailure
} from './dealSlice';

function* fetchAllDealsSaga() {
    try {
        const deals: Deal[] = yield call(dealService.getAllDeals);
        yield put(fetchAllDealsSuccess(deals));
    } catch (error: any) {
        yield put(fetchAllDealsFailure(error.response?.data?.message || 'Failed to fetch deals'));
        toast.error(error.response?.data?.message || 'Failed to fetch deals');
    }
}

function* fetchDealByIdSaga(action: PayloadAction<string>) {
    try {
        const deal: Deal = yield call(dealService.getDealById, action.payload);
        yield put(fetchDealByIdSuccess(deal));
    } catch (error: any) {
        yield put(fetchDealByIdFailure(error.response?.data?.message || 'Failed to fetch deal details'));
        toast.error(error.response?.data?.message || 'Failed to fetch deal details');
    }
}

function* createDealSaga(action: PayloadAction<string>) {
    try {
        const newDeal: Deal = yield call(dealService.createDeal, action.payload);
        yield put(createDealSuccess(newDeal));
        toast.success('Bid accepted and Deal created successfully!');
    } catch (error: any) {
        yield put(createDealFailure(error.response?.data?.message || 'Failed to create deal'));
        toast.error(error.response?.data?.message || 'Failed to create deal');
    }
}

function* createDirectDealSaga(action: PayloadAction<string>) {
    try {
        const newDeal: Deal = yield call(dealService.createDirectDeal, action.payload);
        yield put(createDirectDealSuccess(newDeal));
        toast.success('Deal created successfully! Redirecting to payment...');

        // Wait briefly for UI payload propagation, then force navigator route.
        setTimeout(() => {
            window.location.href = `/deals/${newDeal._id}`;
        }, 1000);
    } catch (error: any) {
        yield put(createDirectDealFailure(error.response?.data?.message || 'Failed to buy instantly'));
        toast.error(error.response?.data?.message || 'Failed to buy instantly');
    }
}

function* updateDealStatusSaga(action: PayloadAction<{ dealId: string; status: DealStatus; payment?: any; shipping?: any }>) {
    try {
        const { dealId, status, payment, shipping } = action.payload;
        const updatedDeal: Deal = yield call(dealService.updateDealStatus, dealId, { status, payment, shipping });
        yield put(updateDealStatusSuccess(updatedDeal));
        toast.success(`Deal status updated to ${status}`);
    } catch (error: any) {
        yield put(updateDealStatusFailure(error.response?.data?.message || 'Failed to update deal status'));
        toast.error(error.response?.data?.message || 'Failed to update deal status');
    }
}


export function* watchDealSagas() {
    yield takeLatest(fetchAllDealsRequest.type, fetchAllDealsSaga);
    yield takeLatest(fetchDealByIdRequest.type, fetchDealByIdSaga);
    yield takeLatest(createDealRequest.type, createDealSaga);
    yield takeLatest(createDirectDealRequest.type, createDirectDealSaga);
    yield takeLatest(updateDealStatusRequest.type, updateDealStatusSaga);
}
