import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Auction, SubmitAuctionPayload } from "../../types/auction";

interface AuctionState {
    items: Auction[];
    currentAuction: Auction | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuctionState = {
    items: [],
    currentAuction: null,
    loading: false,
    error: null,
};

const auctionSlice = createSlice({
    name: "auction",
    initialState,
    reducers: {
        // Fetch All
        fetchAuctionsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchAuctionsSuccess: (state, action: PayloadAction<Auction[]>) => {
            state.loading = false;
            state.items = action.payload;
        },
        fetchAuctionsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetch Single
        fetchAuctionByIdStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
            state.currentAuction = null;
        },
        fetchAuctionByIdSuccess: (state, action: PayloadAction<Auction>) => {
            state.loading = false;
            state.currentAuction = action.payload;
        },
        fetchAuctionByIdFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create
        createAuctionStart: (state, _action: PayloadAction<{ inventoryId: string; payload: SubmitAuctionPayload }>) => {
            state.loading = true;
            state.error = null;
        },
        createAuctionSuccess: (state, action: PayloadAction<Auction>) => {
            state.loading = false;
            state.items.unshift(action.payload);
        },
        createAuctionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update
        updateAuctionStart: (state, _action: PayloadAction<{ id: string; payload: Partial<SubmitAuctionPayload> }>) => {
            state.loading = true;
            state.error = null;
        },
        updateAuctionSuccess: (state, action: PayloadAction<Auction>) => {
            state.loading = false;
            const index = state.items.findIndex((a) => a._id === action.payload._id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
            if (state.currentAuction?._id === action.payload._id) {
                state.currentAuction = action.payload;
            }
        },
        updateAuctionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── Called from createBidSuccess saga — updates price + bidIds live ──
        updateHighestBid: (state, action: PayloadAction<{
            auctionId: string;
            highestBidPrice: number;
            bidId: string;
        }>) => {
            const auction = state.items.find((a) => a._id === action.payload.auctionId);
            if (auction) {
                auction.highestBidPrice = action.payload.highestBidPrice;
                auction.bidIds = [...(auction.bidIds ?? []), action.payload.bidId];
            }
        },

        // Delete
        deleteAuctionStart: (state, _action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        deleteAuctionSuccess: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.items = state.items.filter((a) => a._id !== action.payload);
            if (state.currentAuction?._id === action.payload) {
                state.currentAuction = null;
            }
        },
        deleteAuctionFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
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
    updateHighestBid,         // ← export this
    deleteAuctionStart,
    deleteAuctionSuccess,
    deleteAuctionFailure,
} = auctionSlice.actions;

export default auctionSlice.reducer;