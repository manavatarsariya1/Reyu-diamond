export interface SubmitAuctionPayload {
    basePrice: number;
    startDate: string; // ISO String
    endDate: string; // ISO String
}

export interface Auction {
    _id: string;
    recipient: string;
    inventoryId: string;
    basePrice: number;
    highestBidPrice: number;
    highestBidderId?: string;
    bidIds: string[];
    highestBidId?: string;
    status: "ACTIVE" | "CLOSED" | "CANCELLED";
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}
