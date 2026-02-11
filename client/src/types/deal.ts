import type { DiamondListing } from "./listing";
import type { Bid } from "./bid";

export enum DealStatus {
    CREATED = 'Created',
    PAYMENT_PENDING = 'Payment Pending',
    IN_ESCROW = 'In Escrow',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    COMPLETED = 'Completed',
    DISPUTED = 'Disputed',
    CANCELLED = 'Cancelled',
}

export type DealLogistics = {
    shippingCarrier?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    shippingAddress?: string;

    paymentMethod?: string;
    paymentTransactionId?: string;
    escrowId?: string;
};

export type Deal = {
    id: string;
    listing: DiamondListing;
    acceptedBid: Bid;

    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;

    status: DealStatus;
    finalPrice: number;
    logistics: DealLogistics;

    createdAt: string;
    updatedAt: string;

    // Flags
    isDisputed: boolean;
    hasDocuments: boolean;
}
