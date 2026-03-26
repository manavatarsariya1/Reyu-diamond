import api from './axios';

export interface ChatParticipant {
    _id: string;
    username: string;
    email: string;
}

export interface PotentialPartner {
    userId: string;
    username: string;
    contextId: string;
    contextType: string;
    itemTitle: string;
}

export interface ChatMessage {
    _id: string;
    conversationId: string;
    sender: ChatParticipant | string;
    content: string;
    attachments: {
        url: string;
        publicId: string;
        resourceType: string;
    }[];
    readBy: string[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: ChatParticipant[];
    contextId: any;
    contextType: "Auction" | "Inventory";
    lastMessage?: ChatMessage;
    unreadCounts: Record<string, number>;
    updatedAt: string;
}

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export const chatService = {
    /**
     * Get all conversations for the current user
     */
    getConversations: async (): Promise<Conversation[]> => {
        const response = await api.get('/chat/conversations', {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Get messages for a specific conversation
     */
    getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
        const response = await api.get(`/messages/${conversationId}`, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Send a new message
     */
    sendMessage: async (conversationId: string, content: string, files?: File[]): Promise<ChatMessage> => {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        formData.append('content', content);
        if (files) {
            files.forEach(file => formData.append('files', file));
        }

        const response = await api.post('/messages', formData, {
            headers: {
                ...authHeaders(),
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data.data;
    },

    /**
     * Mark all messages in a conversation as read
     */
    markAsRead: async (conversationId: string): Promise<void> => {
        await api.put(`/chat/conversations/${conversationId}/read`, {}, {
            headers: authHeaders()
        });
    },

    /**
     * Create or find a conversation
     */
    createConversation: async (participants: string[], contextId: string, contextType: "Auction" | "Inventory"): Promise<Conversation> => {
        const body: any = { participants };
        if (contextType === "Auction") {
            body.auctionId = contextId;
        } else {
            body.inventoryId = contextId;
        }

        const response = await api.post('/chat/conversations', body, {
            headers: authHeaders()
        });
        return response.data.data;
    },

    /**
     * Get list of potential chat partners
     */
    getPotentialPartners: async (): Promise<PotentialPartner[]> => {
        const response = await api.get('/chat/potential-partners', {
            headers: authHeaders()
        });
        return response.data.data;
    }
};
