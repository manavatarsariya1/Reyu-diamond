import type { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "./diamond";

export const ListingStatus = {
    ACTIVE: 'Active',
    LOCKED: 'Locked', // When a bid is accepted
    SOLD: 'Sold',
} as const;

export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];

export interface DiamondListing {
    id: string;
    sellerId: any;
    sellerName: string; 
    sellerRating?: { average: number; count: number };
    sellerBadges?: string[];

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
    timeLeft?: string; // For display

    // Bid Info
    currentHighestBid?: number;
    totalBids: number;
    cut?: string;
    barcode?: string;
}
