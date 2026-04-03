import type { Conversation } from "@/types/chat.ts";
import { cn } from "@/lib/utils";
import { User, Diamond, ShieldCheck } from "lucide-react";

interface ConversationItemProps {
    conversation: Conversation;
    isActive?: boolean;
    onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    // Determine the "other" participant (assuming context user is 'You')
    const otherParticipant = conversation.participants.find(p => p.id !== 'current-user') || conversation.participants[0];

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:bg-white hover:shadow-sm",
                isActive ? "bg-white shadow-sm border-gray-200 ring-1 ring-gray-100" : "bg-transparent hover:border-gray-200"
            )}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 overflow-hidden">
                        {otherParticipant.avatar ? (
                            <img src={otherParticipant.avatar} alt={otherParticipant.name} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-6 w-6" />
                        )}
                    </div>
                    {otherParticipant.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <h4 className={cn("font-semibold text-sm truncate pr-2", isActive ? "text-indigo-900" : "text-gray-900")}>
                            {otherParticipant.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                            {formatTime(conversation.lastMessage?.timestamp)}
                        </span>
                    </div>

                    <p className={cn("text-xs truncate mb-1.5", conversation.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500")}>
                        {conversation.lastMessage?.content || "Start a conversation"}
                    </p>

                    {/* Context Tag */}
                    <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[120px]">
                            {conversation.context.type === 'listing' ? <Diamond className="w-2.5 h-2.5 mr-1" /> : <ShieldCheck className="w-2.5 h-2.5 mr-1" />}
                            {conversation.context.title}
                        </span>
                        {conversation.unreadCount > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                                {conversation.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
