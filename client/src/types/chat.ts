export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: MessageStatus;

    // Optional attachment support (future proofing)
    attachments?: string[];
};

export type ChatContext = {
    type: 'listing' | 'deal';
    referenceId: string;
    thumbnail?: string;
    title: string;
    subtitle?: string;
    status: string; // "Active", "Sold", "In Escrow" etc
};

export type Conversation = {
    id: string;
    participants: {
        id: string;
        name: string;
        avatar?: string;
        role: 'Buyer' | 'Seller' | 'Admin';
        isOnline?: boolean;
    }[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;

    // Context linking
    context: ChatContext;
    isArchived: boolean;
};
