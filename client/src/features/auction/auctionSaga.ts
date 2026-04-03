import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "sonner";
import { auctionService } from "../../api/auctionService";
import {
    fetchAuctionsStart,
    fetchAuctionsSuccess,
    fetchAuctionsFailure,
    fetchAuctionByIdStart,
    fetchAuctionByIdSuccess,
    fetchAuctionByIdFailure,
    createAuctionStart,
    createAuctionSuccess,
    createAuctionFailure,
    updateAuctionStart,
    updateAuctionSuccess,
    updateAuctionFailure,
    deleteAuctionStart,
    deleteAuctionSuccess,
    deleteAuctionFailure,
} from "./auctionSlice";
import type { Auction } from "../../types/auction";

// Worker Sagas
function* fetchAuctionsSaga() {
    try {
        const auctions: Auction[] = yield call(auctionService.getAuctions);
        yield put(fetchAuctionsSuccess(auctions));
    } catch (error: any) {
        yield put(fetchAuctionsFailure(error.response?.data?.message || "Failed to fetch auctions."));
    }
}

function* fetchAuctionByIdSaga(action: ReturnType<typeof fetchAuctionByIdStart>) {
    try {
        const auction: Auction = yield call(auctionService.getAuctionById, action.payload);
        yield put(fetchAuctionByIdSuccess(auction));
    } catch (error: any) {
        yield put(fetchAuctionByIdFailure(error.response?.data?.message || "Failed to fetch auction details."));
    }
}

function* createAuctionSaga(action: ReturnType<typeof createAuctionStart>) {
    try {
        const { inventoryId, payload } = action.payload;
        // Call the service with JSON payload and inventory ID
        const newAuction: Auction = yield call(auctionService.createAuction, inventoryId, payload);
        yield put(createAuctionSuccess(newAuction));
        toast.success("Auction created successfully!");
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to create auction. Please check your data.";
        yield put(createAuctionFailure(errorMessage));
        toast.error(errorMessage);
    }
}

function* updateAuctionSaga(action: ReturnType<typeof updateAuctionStart>) {
    try {
        const { id, payload } = action.payload;
        const updatedAuction: Auction = yield call(auctionService.updateAuction, id, payload);
        yield put(updateAuctionSuccess(updatedAuction));
        toast.success("Auction updated successfully!");
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to update auction.";
        yield put(updateAuctionFailure(errorMessage));
        toast.error(errorMessage);
    }
}

function* deleteAuctionSaga(action: ReturnType<typeof deleteAuctionStart>) {
    try {
        yield call(auctionService.deleteAuction, action.payload);
        yield put(deleteAuctionSuccess(action.payload));
        toast.success("Auction deleted successfully!");
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to delete auction.";
        yield put(deleteAuctionFailure(errorMessage));
        toast.error(errorMessage);
    }
}

// Watcher Saga
export function* auctionWatcherSaga() {
    yield takeLatest(fetchAuctionsStart.type, fetchAuctionsSaga);
    yield takeLatest(fetchAuctionByIdStart.type, fetchAuctionByIdSaga);
    yield takeLatest(createAuctionStart.type, createAuctionSaga);
    yield takeLatest(updateAuctionStart.type, updateAuctionSaga);
    yield takeLatest(deleteAuctionStart.type, deleteAuctionSaga);
}
