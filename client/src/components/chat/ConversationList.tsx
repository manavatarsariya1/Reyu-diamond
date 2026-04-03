import type { Conversation } from "@/types/chat.ts";
import { ConversationItem } from "./ConversationItem";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConversationListProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat?: () => void;
}

export function ConversationList({ conversations, activeId, onSelect, onNewChat }: ConversationListProps) {
    const [search, setSearch] = useState("");

    const filtered = conversations?.filter(c =>
        c.participants.some((p: any) => p?.name?.toLowerCase().includes(search.toLowerCase())) ||
        c.context.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        onClick={onNewChat}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-9 bg-white shadow-sm border-gray-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {filtered.length > 0 ? (
                    filtered.map(conv => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === activeId}
                            onClick={() => onSelect(conv.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 px-4">
                        <p className="text-sm text-gray-400">No conversations found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
