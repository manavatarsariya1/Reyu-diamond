export enum PaymentStatus {
    PENDING = 'Pending Payment',
    IN_ESCROW = 'In Escrow',
    RELEASED = 'Released',
    REFUNDED = 'Refunded',
    FAILED = 'Failed',
    DISPUTED = 'Disputed'
}

export enum DisputeStatus {
    NONE = 'None',
    OPEN = 'Open',
    UNDER_REVIEW = 'Under Review',
    RESOLVED = 'Resolved',
    REJECTED = 'Rejected'
}

export type EscrowTransaction = {
    id: string;
    dealId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    payerId: string;
    payeeId: string;
    escrowFee: number;
    disputeStatus: DisputeStatus;

    // Timestamps
    createdAt: string;
    paymentDeadline: string;
    paidAt?: string;
    releasedAt?: string;
    refundedAt?: string;

    // Metadata
    paymentMethod?: string;
    transactionReference?: string;
};
