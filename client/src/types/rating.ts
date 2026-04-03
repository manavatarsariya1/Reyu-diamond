export const BadgeTier = {
    DIAMOND: 'DIAMOND',
    PLATINUM: 'PLATINUM',
    GOLD: 'GOLD',
    SILVER: 'SILVER',
    BRONZE: 'BRONZE'
} as const;

export type BadgeTier = typeof BadgeTier[keyof typeof BadgeTier];

export type Rating = {
    id: string;
    dealId: string;
    raterId: string;
    raterName?: string;
    raterAvatar?: string;
    ratedUserId: string;
    score: number; // 1-5
    comment?: string;
    createdAt: string;
};

export type Reputation = {
    userId: string;
    averageScore: number;
    totalDeals: number;
    totalRatings: number;
    badgeTier: BadgeTier;

    // Distribution for analytics
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };

    // History
    recentRatings?: Rating[];
    isKycVerified?: boolean;
};
