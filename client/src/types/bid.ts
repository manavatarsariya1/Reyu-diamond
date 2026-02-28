export enum BidStatus {
    SUBMITTED = 'SUBMITTED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
}

export interface Bid {
    _id: string;
    auctionId: string | any; // Could be populated auction object
    buyerId: string | any;   // Could be populated user object
    bidAmount: number;
    notes?: string;
    status: BidStatus;
    createdAt: string;
    updatedAt: string;
    isHighestBid?: boolean;
}

export interface CreateBidPayload {
    bidAmount: number;
}
