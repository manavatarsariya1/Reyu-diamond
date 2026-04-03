export interface Notification {
    _id: string;
    recipient: string;
    sender?: {
        _id: string;
        username: string;
        avatar?: string;
    };
    title: string;
    body: string;
    data?: Record<string, any>;
    type: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
