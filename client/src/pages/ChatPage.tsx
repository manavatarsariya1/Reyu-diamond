import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { RootState } from "@/app/store";
import { MessageStatus } from "@/types/chat.ts";
import {
    fetchConversationsRequest,
    fetchMessagesRequest,
    sendMessageRequest,
    receiveMessage,
    setActiveConversation,
    markAsReadRequest,
    fetchPotentialPartnersRequest,
    createConversationRequest
} from "@/features/chat/chatSlice";
import { socketService } from "@/utils/socket";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        conversations,
        activeConversation,
        messages,
        potentialPartners,
        isLoading
    } = useSelector((state: RootState) => state.chat);
    
    const { user } = useSelector((state: RootState) => state.auth);
    const token = getToken();

    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    // Initial load and socket connection
    useEffect(() => {
        if (token) {
            socketService.connect(token);
            dispatch(fetchConversationsRequest());
            
            // Global listener for new messages
            socketService.onNewMessage((message) => {
                dispatch(receiveMessage(message));
            });
        }

        return () => {
            // socketService.disconnect(); // Keep alive for notifications maybe?
            socketService.offNewMessage();
        };
    }, [token, dispatch]);

    // Handle conversation selection from URL
    useEffect(() => {
        if (id) {
            dispatch(setActiveConversation(id));
            dispatch(fetchMessagesRequest(id));
            dispatch(markAsReadRequest(id));
            socketService.joinConversation(id);
        } else {
            dispatch(setActiveConversation(null));
        }

        return () => {
            if (id) {
                socketService.leaveConversation(id);
            }
        };
    }, [id, dispatch]);

    const handleSelectConversation = (convId: string) => {
        navigate(`/messages/${convId}`);
    };

    const handleSendMessage = (text: string, files?: File[]) => {
        if (!id) return;

        dispatch(sendMessageRequest({
            conversationId: id,
            content: text,
            files
        }));
    };

    const currentUser = {
        id: (user as any)?._id || (user as any)?.id || "",
        name: user?.username || "You"
    };

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

            <ChatLayout
                sidebar={
                    <ConversationList
                        conversations={(Array.isArray(conversations) ? conversations : []).map(c => ({
                            id: c._id,
                            participants: c.participants.map(p => ({
                                id: p._id,
                                name: p.username,
                                isOnline: false, // Could be enhanced with socket presence
                                role: "Seller" // Defaulting or mapping
                            })),
                            lastMessage: c.lastMessage ? {
                                id: c.lastMessage._id,
                                conversationId: c.lastMessage.conversationId,
                                senderId: typeof c.lastMessage.sender === 'string' ? c.lastMessage.sender : (c.lastMessage.sender as any)._id || (c.lastMessage.sender as any).id,
                                content: c.lastMessage.content,
                                timestamp: c.lastMessage.createdAt,
                                status: MessageStatus.SENT
                            } : undefined,
                            unreadCount: c.unreadCounts[user?.id || ""] || 0,
                            updatedAt: c.updatedAt,
                            context: {
                                type: c.contextType.toLowerCase() as any,
                                referenceId: typeof c.contextId === 'string' ? c.contextId : (c.contextId as any)?._id,
                                title: c.contextId?.title || "Item",
                                status: "Active"
                            },
                            isArchived: false
                        }))}
                        activeId={id || null}
                        onSelect={handleSelectConversation}
                        onNewChat={() => {
                            setIsNewChatModalOpen(true);
                            dispatch(fetchPotentialPartnersRequest());
                        }}
                    />
                }
            >
                {activeConversation ? (
                    <ChatWindow
                        conversation={{
                            id: activeConversation._id,
                            participants: activeConversation.participants.map(p => ({
                                id: p._id,
                                name: p.username,
                                isOnline: false,
                                role: "Buyer" // Defaulting or mapping
                            })),
                            lastMessage: undefined, // Not needed by ChatWindow
                            unreadCount: 0,
                            updatedAt: activeConversation.updatedAt,
                            context: {
                                type: activeConversation.contextType.toLowerCase() as any,
                                referenceId: typeof activeConversation.contextId === 'string' ? activeConversation.contextId : activeConversation.contextId?._id,
                                title: activeConversation.contextId?.title || "Item",
                                status: "Active"
                            },
                            isArchived: false
                        }}
                        messages={(Array.isArray(messages) ? messages : []).map(m => ({
                            id: m._id,
                            conversationId: m.conversationId,
                            senderId: typeof m.sender === 'string' ? m.sender : (m.sender as any)._id || (m.sender as any).id,
                            content: m.content,
                            timestamp: m.createdAt,
                            status: MessageStatus.SENT,
                            attachments: m.attachments?.map(a => a.url) || []
                        }))}
                        currentUser={currentUser}
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

            {/* New Chat Modal */}
            <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start a New Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">
                            Select a transaction or item to start an inquiry.
                        </p>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {potentialPartners?.length > 0 ? (
                                    potentialPartners.map((pp) => (
                                        <div 
                                            key={`${pp.userId}-${pp.contextId}`}
                                            className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
                                            onClick={() => {
                                                dispatch(createConversationRequest({
                                                    participants: [pp.userId],
                                                    contextId: pp.contextId,
                                                    contextType: pp.contextType as any
                                                }));
                                                setIsNewChatModalOpen(false);
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 truncate">{pp.username}</span>
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase whitespace-nowrap">
                                                        {pp.contextType}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Info className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">{pp.itemTitle}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="group-hover:text-primary">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        {isLoading ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        ) : (
                                            <p>No potential partners found. You need active bids or deals to start a chat.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
