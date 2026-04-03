import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
    sidebar: ReactNode;
    children: ReactNode; // Main chat window
    className?: string;
}

export function ChatLayout({ sidebar, children, className }: ChatLayoutProps) {
    return (
        <div className={cn("flex h-[calc(100vh-theme(spacing.20))] bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden", className)}>
            {/* Sidebar (Conversation List) */}
            <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50">
                {sidebar}
            </div>

            {/* Main Chat Area */}
            <div className="hidden md:flex flex-1 flex-col bg-white">
                {children}
            </div>

            {/* Mobile View Handling: Ideally routing handles showing one or the other on mobile */}
        </div>
    );
}
