import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Deal, DealStatus } from '@/types/deal';

interface DealState {
    deals: Deal[];
    currentDeal: Deal | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DealState = {
    deals: [],
    currentDeal: null,
    isLoading: false,
    error: null,
};

const dealSlice = createSlice({
    name: 'deal',
    initialState,
    reducers: {
        // Fetch All Deals
        fetchAllDealsRequest(state) {
            state.isLoading = true;
            state.error = null;
        },
        fetchAllDealsSuccess(state, action: PayloadAction<Deal[]>) {
            state.isLoading = false;
            state.deals = action.payload;
        },
        fetchAllDealsFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Fetch Single Deal
        fetchDealByIdRequest(state, _action: PayloadAction<string>) {
            state.isLoading = true;
            state.error = null;
        },
        fetchDealByIdSuccess(state, action: PayloadAction<Deal>) {
            state.isLoading = false;
            state.currentDeal = action.payload;
        },
        fetchDealByIdFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Create Deal
        createDealRequest(state, _action: PayloadAction<string>) {
            state.isLoading = true;
            state.error = null;
        },
        createDealSuccess(state, action: PayloadAction<Deal>) {
            state.isLoading = false;
            state.deals.push(action.payload);
            state.currentDeal = action.payload;
        },
        createDealFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Create Direct Deal (Buy It Now)
        createDirectDealRequest(state, _action: PayloadAction<string>) {
            state.isLoading = true;
            state.error = null;
        },
        createDirectDealSuccess(state, action: PayloadAction<Deal>) {
            state.isLoading = false;
            state.deals.push(action.payload);
            state.currentDeal = action.payload;
        },
        createDirectDealFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Update Deal
        updateDealStatusRequest(state, _action: PayloadAction<{ dealId: string; status: DealStatus; payment?: any; shipping?: any }>) {
            state.isLoading = true;
            state.error = null;
        },
        updateDealStatusSuccess(state, action: PayloadAction<Deal>) {
            state.isLoading = false;
            const updatedDeal = action.payload;

            // Update in array
            const index = state.deals.findIndex(d => d._id === updatedDeal._id);
            if (index !== -1) {
                state.deals[index] = updatedDeal;
            }

            // Update current if selected
            if (state.currentDeal?._id === updatedDeal._id) {
                state.currentDeal = updatedDeal;
            }
        },
        updateDealStatusFailure(state, action: PayloadAction<string>) {
            state.isLoading = false;
            state.error = action.payload;
        },
    },
});

export const {
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
} = dealSlice.actions;

export default dealSlice.reducer;
