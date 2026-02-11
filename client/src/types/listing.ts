import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "./preference";

export enum ListingStatus {
    ACTIVE = 'Active',
    LOCKED = 'Locked', // When a bid is accepted
    SOLD = 'Sold',
}

export interface DiamondListing {
    id: string;
    sellerId: string;
    sellerName: string; // Simplification for UI

    // Diamond Specs
    shape: DiamondShape;
    carat: number;
    color: DiamondColor;
    clarity: DiamondClarity;
    certification: DiamondCertification;
    reportNumber: string;

    // Pricing
    price: number;
    minBidAmount?: number;

    // Metadata
    description?: string;
    imageUrl: string;
    location: string;

    status: ListingStatus;
    createdAt: string;
    expiresAt?: string;

    // Bid Info
    currentHighestBid?: number;
    totalBids: number;
}
