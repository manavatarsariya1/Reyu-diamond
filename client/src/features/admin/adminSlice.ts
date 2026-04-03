import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AdminState {
    users: any[];
    kycs: any[];
    stats: any | null;
    loading: {
        users: boolean;
        kycs: boolean;
        stats: boolean;
        action: boolean;
    };
    error: string | null;
}

const initialState: AdminState = {
    users: [],
    kycs: [],
    stats: null,
    loading: {
        users: false,
        kycs: false,
        stats: false,
        action: false,
    },
    error: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        // Stats
        fetchStatsStart: (state) => {
            state.loading.stats = true;
            state.error = null;
        },
        fetchStatsSuccess: (state, action: PayloadAction<any>) => {
            state.stats = action.payload;
            state.loading.stats = false;
        },
        fetchStatsFailure: (state, action: PayloadAction<string>) => {
            state.loading.stats = false;
            state.error = action.payload;
        },

        // Users
        fetchUsersStart: (state) => {
            state.loading.users = true;
            state.error = null;
        },
        fetchUsersSuccess: (state, action: PayloadAction<any[]>) => {
            state.users = Array.isArray(action.payload) ? action.payload : [];
            state.loading.users = false;
        },
        fetchUsersFailure: (state, action: PayloadAction<string>) => {
            state.loading.users = false;
            state.error = action.payload;
        },

        // KYC
        fetchKycsStart: (state) => {
            state.loading.kycs = true;
            state.error = null;
        },
        fetchKycsSuccess: (state, action: PayloadAction<any[]>) => {
            state.kycs = Array.isArray(action.payload) ? action.payload : [];
            state.loading.kycs = false;
        },
        fetchKycsFailure: (state, action: PayloadAction<string>) => {
            state.loading.kycs = false;
            state.error = action.payload;
        },

        // Actions (Generic for simple updates)
        adminActionStart: (state) => {
            state.loading.action = true;
            state.error = null;
        },
        adminActionSuccess: (state) => {
            state.loading.action = false;
        },
        adminActionFailure: (state, action: PayloadAction<string>) => {
            state.loading.action = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchStatsStart,
    fetchStatsSuccess,
    fetchStatsFailure,
    fetchUsersStart,
    fetchUsersSuccess,
    fetchUsersFailure,
    fetchKycsStart,
    fetchKycsSuccess,
    fetchKycsFailure,
    adminActionStart,
    adminActionSuccess,
    adminActionFailure,
} = adminSlice.actions;

export default adminSlice.reducer;
