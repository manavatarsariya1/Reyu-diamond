import type { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "./preference";

export enum InventoryStatus {
    AVAILABLE = 'Available',
    LISTED = 'Listed',
    LOCKED = 'Locked',
    COMPLETED = 'Sold'
}

export type InventoryItem = {
    id: string;
    sellerId: string;

    // Specs
    shape: DiamondShape;
    carat: number;
    color: DiamondColor;
    clarity: DiamondClarity;
    certification: DiamondCertification;
    reportNumber?: string;

    // Image
    thumbnail?: string;
    images?: string[];

    // Management
    status: InventoryStatus;
    barcode?: string;
    sku?: string;

    // Pricing (Internal)
    costPrice?: number;
    targetPrice?: number;

    // Linking
    listingId?: string;
    activeDealId?: string;

    createdAt: string;
    updatedAt: string;
};
