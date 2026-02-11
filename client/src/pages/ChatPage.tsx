import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Conversation, Message } from "@/types/chat.ts";
import { MessageStatus } from "@/types/chat.ts";
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available, else I'll mockup

// Mock Data
const CURRENT_USER = { id: "current-user", name: "You" };

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        participants: [
            { id: "current-user", name: "You", role: "Seller" },
            { id: "buyer-1", name: "Diamond Corp", role: "Buyer", isOnline: true }
        ],
        lastMessage: {
            id: "m1",
            conversationId: "c1",
            senderId: "buyer-1",
            content: "Is standard shipping available?",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            status: MessageStatus.READ
        },
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
        context: {
            type: 'listing',
            referenceId: "l1",
            title: "1.02ct Round Brilliant",
            status: "Active"
        },
        isArchived: false
    },
    {
        id: "c2",
        participants: [
            { id: "current-user", name: "You", role: "Buyer" },
            { id: "seller-2", name: "Gemstone Traders", role: "Seller", isOnline: false }
        ],
        lastMessage: {
            id: "m2",
            conversationId: "c2",
            senderId: "current-user",
            content: "Offer sent for $3000.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: MessageStatus.DELIVERED
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        context: {
            type: 'deal',
            referenceId: "d2",
            title: "0.90ct Pear Shape",
            status: "In Escrow"
        },
        isArchived: false
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    "c1": [
        {
            id: "m1-1",
            conversationId: "c1",
            senderId: "current-user",
            content: "Hello, regarding your inquiry on the Round Brilliant.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: MessageStatus.READ
        },
        {
            id: "m1-2",
            conversationId: "c1",
            senderId: "buyer-1",
            content: "Yes, I was wondering about shipping options.",
            timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
            status: MessageStatus.READ
        },
        {
            id: "m1",
            conversationId: "c1",
            senderId: "buyer-1",
            content: "Is standard shipping available?",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            status: MessageStatus.READ
        }
    ],
    "c2": [
        {
            id: "m2-1",
            conversationId: "c2",
            senderId: "current-user",
            content: "Offer sent for $3000.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: MessageStatus.DELIVERED
        }
    ]
};

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(id || null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (id) {
            setActiveConversationId(id);
            // Load messages for this conversation
            setMessages(MOCK_MESSAGES[id] || []);

            // Mark as read logic would go here
            setConversations(prev => prev.map(c =>
                c.id === id ? { ...c, unreadCount: 0 } : c
            ));
        } else {
            setActiveConversationId(null);
            setMessages([]);
        }
    }, [id]);

    const handleSelectConversation = (convId: string) => {
        navigate(`/messages/${convId}`);
    };

    const handleSendMessage = (text: string) => {
        if (!activeConversationId) return;

        const newMessage: Message = {
            id: uuidv4(),
            conversationId: activeConversationId,
            senderId: CURRENT_USER.id,
            content: text,
            timestamp: new Date().toISOString(),
            status: MessageStatus.SENT
        };

        // UI Update
        setMessages(prev => [...prev, newMessage]);

        // Simulate Network Delay & Status Update
        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: MessageStatus.DELIVERED } : m
            ));
        }, 1000);

        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === newMessage.id ? { ...m, status: MessageStatus.READ } : m
            ));
        }, 2500);

        // Update last message in list
        setConversations(prev => prev.map(c =>
            c.id === activeConversationId
                ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
                : c
        ));
    };

    return (
        <div className="h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

            <ChatLayout
                sidebar={
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversationId}
                        onSelect={handleSelectConversation}
                    />
                }
            >
                {activeConversationId ? (
                    <ChatWindow
                        conversation={conversations.find(c => c.id === activeConversationId)!}
                        messages={messages}
                        currentUser={CURRENT_USER}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </ChatLayout>
        </div>
    );
}
