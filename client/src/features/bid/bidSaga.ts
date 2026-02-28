import { call, put, takeLatest } from "redux-saga/effects";
import { bidService } from "@/api/bidService";
import type { Bid, CreateBidPayload, BidStatus } from "@/types/bid";
import * as actions from "./bidSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { updateHighestBid } from "@/features/auction/auctionSlice"; // ← import

function* fetchBidsSaga(action: PayloadAction<string>) {
    try {
        const data: Bid[] = yield call([bidService, bidService.getAllBids], action.payload);
        yield put(actions.fetchBidsSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to fetch bids";
        yield put(actions.fetchBidsFailure(message));
    }
}

function* fetchAllMyBidsSaga() {
    try {
        const data: any[] = yield call([bidService, bidService.getAllMyBids]);
        yield put(actions.fetchAllMyBidsSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to fetch your bids";
        yield put(actions.fetchAllMyBidsFailure(message));
    }
}

function* fetchMyBidSaga(action: PayloadAction<string>) {
    try {
        const data: Bid = yield call([bidService, bidService.getMyBid], action.payload);
        yield put(actions.fetchMyBidSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to fetch your bid";
        yield put(actions.fetchMyBidFailure(message));
    }
}

function* createBidSaga(action: PayloadAction<{ auctionId: string; payload: CreateBidPayload }>) {
    try {
        const data: Bid = yield call(
            [bidService, bidService.createBid],
            action.payload.auctionId,
            action.payload.payload
        );
        yield put(actions.createBidSuccess(data));

        // ── Update auction's highestBidPrice live in Redux ────────────────
        yield put(updateHighestBid({
            auctionId: action.payload.auctionId,
            highestBidPrice: data.bidAmount,
            bidId: data._id,
        }));

        toast.success("Bid placed successfully");
    } catch (error: any) {
        const message = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to place bid";
        yield put(actions.createBidFailure(message));
        toast.error(message);
    }
}

function* updateBidStatusSaga(action: PayloadAction<{ bidId: string; status: BidStatus }>) {
    try {
        const data: Bid = yield call(
            [bidService, bidService.updateBidStatus],
            action.payload.bidId,
            action.payload.status
        );
        yield put(actions.updateBidStatusSuccess(data));
        toast.success(`Bid ${action.payload.status.toLowerCase()} successfully`);
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to update bid status";
        yield put(actions.updateBidStatusFailure(message));
        toast.error(message);
    }
}

export function* bidWatcherSaga() {
    yield takeLatest(actions.fetchBidsStart.type, fetchBidsSaga);
    yield takeLatest(actions.fetchAllMyBidsStart.type, fetchAllMyBidsSaga);
    yield takeLatest(actions.fetchMyBidStart.type, fetchMyBidSaga);
    yield takeLatest(actions.createBidStart.type, createBidSaga);
    yield takeLatest(actions.updateBidStatusStart.type, updateBidStatusSaga);
}

export default bidWatcherSaga;