import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists or using standard
import { Send, Paperclip, Smile } from "lucide-react";

interface ChatComposerProps {
    onSend: (content: string) => void;
    isDisabled?: boolean;
}

export function ChatComposer({ onSend, isDisabled = false }: ChatComposerProps) {
    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!content.trim() || isDisabled) return;
        onSend(content);
        setContent("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    return (
        <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-10 w-10 flex-shrink-0">
                    <Paperclip className="w-5 h-5" />
                </Button>

                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isDisabled}
                    rows={1}
                    className="flex-grow bg-transparent border-0 focus:ring-0 resize-none py-2.5 max-h-[120px] text-sm text-gray-800 placeholder:text-gray-400"
                />

                <Button
                    onClick={handleSend}
                    disabled={!content.trim() || isDisabled}
                    size="icon"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 w-10 rounded-lg flex-shrink-0 transition-all"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </Button>
            </div>
            {isDisabled && (
                <div className="text-center text-xs text-gray-400 mt-2">
                    This conversation is archived or read-only.
                </div>
            )}
        </div>
    );
}
