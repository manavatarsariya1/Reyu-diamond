import type { Bid } from "./bid";
import type { User } from "./auth";

export type DealStatus =
    | "CREATED"
    | "PAYMENT_PENDING"
    | "IN_ESCROW"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "DISPUTED"
    | "CANCELLED";

export type DealPayment = {
    isPaid: boolean;
    paidAt?: string;
    method?: string;
    transactionId?: string;
};

export type DealShipping = {
    courier?: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
};

export type DealDispute = {
    reason: string;
    raisedBy: string | User;
    raisedAt: string;
    resolvedBy?: string | User;
    resolvedAt?: string;
    resolution?: "REFUND_BUYER" | "RELEASE_SELLER";
    adminNote?: string;
};

export type DealHistory = {
    status: DealStatus;
    changedBy: string | User;
    changedAt: string;
};

export type Deal = {
    _id: string;
    bidId: string | Bid; // Sometimes populated, sometimes String
    auctionId: string | Record<string, unknown>;
    buyerId: string | User;
    sellerId: string | User;

    agreedAmount: number;
    currency: string;
    status: DealStatus;

    payment: DealPayment;
    shipping: DealShipping;
    dispute?: DealDispute;

    history: DealHistory[];
    pdfPath?: string;

    createdAt: string;
    updatedAt: string;
};
