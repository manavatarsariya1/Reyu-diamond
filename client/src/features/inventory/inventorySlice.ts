import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InventoryItem } from "@/types/inventory";
import type { SubmitInventoryPayload } from "@/api/inventoryService";

interface InventoryState {
    items: InventoryItem[];
    loading: boolean;
    error: string | null;
    currentItem: InventoryItem | null;
}

const initialState: InventoryState = {
    items: [],
    loading: false,
    error: null,
    currentItem: null,
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        // Fetch Inventories
        fetchInventoriesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchInventoriesSuccess: (state, action: PayloadAction<InventoryItem[]>) => {
            state.loading = false;
            state.items = action.payload;
        },
        fetchInventoriesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create Inventory
        createInventoryStart: (state, _action: PayloadAction<FormData>) => {
            state.loading = true;
            state.error = null;
        },
        createInventorySuccess: (state, action: PayloadAction<InventoryItem>) => {
            state.loading = false;
            state.items.push(action.payload);
        },
        createInventoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update Inventory
        updateInventoryStart: (state, _action: PayloadAction<{ id: string; payload: Partial<SubmitInventoryPayload> }>) => {
            state.loading = true;
            state.error = null;
        },
        updateInventorySuccess: (state, action: PayloadAction<InventoryItem>) => {
            state.loading = false;
            const index = state.items.findIndex((p) => p._id === action.payload._id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        updateInventoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete Inventory
        deleteInventoryStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        deleteInventorySuccess: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.items = state.items.filter((p) => p._id !== action.payload);
        },
        deleteInventoryFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Set Current Inventory
        setCurrentInventory: (state, action: PayloadAction<InventoryItem | null>) => {
            state.currentItem = action.payload;
        },
    },
});

export const {
    fetchInventoriesStart,
    fetchInventoriesSuccess,
    fetchInventoriesFailure,
    createInventoryStart,
    createInventorySuccess,
    createInventoryFailure,
    updateInventoryStart,
    updateInventorySuccess,
    updateInventoryFailure,
    deleteInventoryStart,
    deleteInventorySuccess,
    deleteInventoryFailure,
    setCurrentInventory,
} = inventorySlice.actions;

export default inventorySlice.reducer;
