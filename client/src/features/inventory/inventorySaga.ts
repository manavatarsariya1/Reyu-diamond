import { call, put, takeLatest } from "redux-saga/effects";
import { inventoryService } from "@/api/inventoryService";
import type { SubmitInventoryPayload } from "@/api/inventoryService";
import * as actions from "./inventorySlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import type { InventoryItem } from "@/types/inventory";

// Worker Sagas
function* fetchInventoriesSaga() {
    try {
        const data: InventoryItem[] = yield call([inventoryService, inventoryService.fetchInventories]);
        yield put(actions.fetchInventoriesSuccess(data));
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to fetch inventories";
        yield put(actions.fetchInventoriesFailure(message));
        toast.error(message);
    }
}

function* createInventorySaga(action: PayloadAction<FormData>) {
    try {
        const data: InventoryItem = yield call([inventoryService, inventoryService.createInventory], action.payload);
        yield put(actions.createInventorySuccess(data));
        toast.success("Inventory item created successfully");
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to create inventory item";
        yield put(actions.createInventoryFailure(message));
        toast.error(message);
    }
}

function* updateInventorySaga(action: PayloadAction<{ id: string; payload: Partial<SubmitInventoryPayload> }>) {
    try {
        const data: InventoryItem = yield call(
            [inventoryService, inventoryService.updateInventory],
            action.payload.id,
            action.payload.payload
        );
        yield put(actions.updateInventorySuccess(data));
        toast.success("Inventory updated successfully");
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to update inventory";
        yield put(actions.updateInventoryFailure(message));
        toast.error(message);
    }
}

function* deleteInventorySaga(action: PayloadAction<string>) {
    try {
        yield call([inventoryService, inventoryService.deleteInventory], action.payload);
        yield put(actions.deleteInventorySuccess(action.payload));
        toast.success("Inventory deleted successfully");
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to delete inventory";
        yield put(actions.deleteInventoryFailure(message));
        toast.error(message);
    }
}

// Watcher Saga
export function* inventoryWatcherSaga() {
    yield takeLatest(actions.fetchInventoriesStart.type, fetchInventoriesSaga);
    yield takeLatest(actions.createInventoryStart.type, createInventorySaga);
    yield takeLatest(actions.updateInventoryStart.type, updateInventorySaga);
    yield takeLatest(actions.deleteInventoryStart.type, deleteInventorySaga);
}

export default inventoryWatcherSaga;
