export enum BidStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    CANCELLED = 'Cancelled',
    OUTBID = 'Outbid',
}

export interface Bid {
    id: string;
    listingId: string;
    bidderId: string;
    bidderName: string; // Simplification or "Bidder #123"

    amount: number;
    note?: string;

    status: BidStatus;
    createdAt: string;
    updatedAt: string;
}
