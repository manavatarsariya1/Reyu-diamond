import { useRef, useEffect } from "react";
import type { Conversation, Message } from "@/types/chat.ts";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { Diamond, ShieldCheck, MoreVertical, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    currentUser: { id: string; name: string };
    onSendMessage: (text: string) => void;
}

export function ChatWindow({ conversation, messages, currentUser, onSendMessage }: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            {/* Context Header */}
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {otherParticipant.name}
                            {otherParticipant.role && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium uppercase tracking-wide">
                                    {otherParticipant.role}
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {conversation.context.type === 'listing' ? <Diamond className="w-3 h-3 text-blue-500" /> : <ShieldCheck className="w-3 h-3 text-purple-500" />}
                            <span className="font-medium text-gray-700">{conversation.context.title}</span>
                            {conversation.context.status && (
                                <span className="text-gray-400">• {conversation.context.status}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-white" ref={scrollRef}>
                <div className="py-6">
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.senderId === currentUser.id}
                            senderName={msg.senderId === currentUser.id ? "You" : otherParticipant.name}
                        />
                    ))}
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-sm text-gray-400">Start the conversation...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Composer */}
            <ChatComposer
                onSend={onSendMessage}
                isDisabled={conversation.isArchived}
            />
        </div>
    );
}
