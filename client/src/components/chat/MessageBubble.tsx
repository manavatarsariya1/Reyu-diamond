import type { Message } from "@/types/chat.ts";
import { MessageStatus } from "@/types/chat.ts";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar?: boolean;
    senderName?: string;
}

export function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={cn("flex w-full mb-4 px-4", isOwn ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[70%] md:max-w-[60%] flex-col", isOwn ? "items-end" : "items-start")}>
                {/* Sender Name (Group Chat Support) */}
                {!isOwn && senderName && (
                    <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>
                )}

                <div
                    className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm text-sm relative group",
                        isOwn
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100"
                    )}
                >
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>

                    <div className={cn(
                        "flex items-center justify-end gap-1 mt-1 text-[10px]",
                        isOwn ? "text-indigo-200" : "text-gray-400"
                    )}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isOwn && (
                            <span>
                                {message.status === MessageStatus.SENT && <Check className="w-3 h-3" />}
                                {message.status === MessageStatus.DELIVERED && <CheckCheck className="w-3 h-3" />}
                                {message.status === MessageStatus.READ && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
