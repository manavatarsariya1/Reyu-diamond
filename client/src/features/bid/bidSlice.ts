import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Bid, CreateBidPayload, BidStatus } from "@/types/bid";

interface BidState {
    items: Bid[];
    myBids: any[];
    myBid: Bid | null;
    loading: boolean;
    error: string | null;
}

const initialState: BidState = {
    items: [],
    myBids: [],
    myBid: null,
    loading: false,
    error: null,
};

const bidSlice = createSlice({
    name: "bid",
    initialState,
    reducers: {
        // Fetch all bids for an auction
        fetchBidsStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        fetchBidsSuccess: (state, action: PayloadAction<Bid[]>) => {
            state.loading = false;
            state.items = action.payload;
        },
        fetchBidsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetch all bids placed by the user
        fetchAllMyBidsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchAllMyBidsSuccess: (state, action: PayloadAction<any[]>) => {
            state.loading = false;
            state.myBids = action.payload;
        },
        fetchAllMyBidsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetch my bid for an auction
        fetchMyBidStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        fetchMyBidSuccess: (state, action: PayloadAction<Bid>) => {
            state.loading = false;
            state.myBid = action.payload;
        },
        fetchMyBidFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create a bid
        createBidStart: (state, _action: PayloadAction<{ auctionId: string, payload: CreateBidPayload }>) => {
            state.loading = true;
            state.error = null;
        },
        createBidSuccess: (state, action: PayloadAction<Bid>) => {
            state.loading = false;
            state.items.push(action.payload);
            state.myBid = action.payload; // Update my bid
        },
        createBidFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update bid status
        updateBidStatusStart: (state, _action: PayloadAction<{ bidId: string; status: BidStatus }>) => {
            state.loading = true;
            state.error = null;
        },
        updateBidStatusSuccess: (state, action: PayloadAction<Bid>) => {
            state.loading = false;
            const index = state.items.findIndex((bid) => bid._id === action.payload._id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.myBid && state.myBid._id === action.payload._id) {
                state.myBid = action.payload;
            }
        },
        updateBidStatusFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Clear my bid state when unmounting
        clearMyBid: (state) => {
            state.myBid = null;
        }
    },
});

export const {
    fetchBidsStart,
    fetchBidsSuccess,
    fetchBidsFailure,
    fetchAllMyBidsStart,
    fetchAllMyBidsSuccess,
    fetchAllMyBidsFailure,
    fetchMyBidStart,
    fetchMyBidSuccess,
    fetchMyBidFailure,
    createBidStart,
    createBidSuccess,
    createBidFailure,
    updateBidStatusStart,
    updateBidStatusSuccess,
    updateBidStatusFailure,
    clearMyBid,
} = bidSlice.actions;

export default bidSlice.reducer;
