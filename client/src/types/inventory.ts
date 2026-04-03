export const InventoryStatus = {
    AVAILABLE: 'AVAILABLE',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    LISTED: 'LISTED',
    SOLD: 'SOLD',
    ON_MEMO: 'ON_MEMO',
    LOCKED: 'LOCKED',
    AUCTION_ENDED: 'AUCTION_ENDED'
} as const;

export type InventoryStatus = typeof InventoryStatus[keyof typeof InventoryStatus];

export type InventoryItem = {
    _id: string; // Map to MongoDB ObjectId
    sellerId: any; // Can be string ID or populated object with username, rating, badges
    title: string;
    description?: string;
    barcode: string;

    // Specs
    carat: number;
    cut: "EXCELLENT" | "VERY_GOOD" | "GOOD" | "FAIR" | "POOR";
    color: "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M";
    clarity: "FL" | "IF" | "VVS1" | "VVS2" | "VS1" | "VS2" | "SI1" | "SI2" | "I1";
    shape: "ROUND" | "PRINCESS" | "CUSHION" | "EMERALD" | "OVAL" | "RADIANT" | "ASSCHER" | "MARQUISE" | "HEART" | "PEAR";

    lab: string;
    location: string;
    price: number;
    currency: string;

    // Management
    status: InventoryStatus | "LOCKED";
    locked: boolean;
    images: string[];
    video?: string;
    videos?: string[];

    activeDealId?: string;

    createdAt: string;
    updatedAt: string;
};
