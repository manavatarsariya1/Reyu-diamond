import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Facebook, Linkedin, Twitter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareInventoryButtonProps {
    inventoryId: string;
    title: string;
    className?: string;
}

const ShareInventoryButton: React.FC<ShareInventoryButtonProps> = ({ 
    inventoryId, 
    title,
    className = "" 
}) => {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, "");
    const shareUrl = `${backendUrl}/api/inventory/seo/${inventoryId}?v=${Date.now()}`;
    const shareText = `Check out this beautiful diamond on Reyu Diamond: ${title}`;

    const copyToClipboard = async (silent = false) => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            if (!silent) toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            toast.error("Failed to copy link");
            return false;
        }
    };

    const handleSocialShare = async (platform: string) => {
        // As requested: Copy link also when clicking social media
        await copyToClipboard(true);
        
        let url = "";
        switch (platform) {
            case "whatsapp":
                url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
                break;
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case "linkedin":
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case "native":
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: `Reyu Diamond - ${title}`,
                            text: shareText,
                            url: shareUrl,
                        });
                        toast.success("Shared successfully!");
                        setIsOpen(false);
                        return;
                    } catch (error) {
                        if ((error as Error).name !== 'AbortError') console.error('Error sharing:', error);
                    }
                }
                break;
        }

        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
            setIsOpen(false);
        }
    };

    const socialPlatforms = [
        { id: "whatsapp", name: "WhatsApp", icon: <MessageCircle className="w-5 h-5" />, color: "bg-[#25D366] hover:bg-[#20ba59]", textColor: "text-white" },
        { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5" />, color: "bg-[#1877F2] hover:bg-[#166fe5]", textColor: "text-white" },
        { id: "twitter", name: "X / Twitter", icon: <Twitter className="w-5 h-5" />, color: "bg-black hover:bg-zinc-800", textColor: "text-white" },
        { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, color: "bg-[#0077B5] hover:bg-[#006399]", textColor: "text-white" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 rounded-xl transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600 border-slate-200 ${className}`}
                >
                    <Share2 className="w-4 h-4" />
                    <span className="font-semibold text-xs text-nowrap">Share</span>
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Share2 className="w-5 h-5" />
                        </div>
                        Share Diamond Listing
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Share this diamond with your network. The link will be copied automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 py-4">
                    {socialPlatforms.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() => handleSocialShare(platform.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-95 ${platform.color} ${platform.textColor} font-semibold text-sm shadow-sm`}
                        >
                            {platform.icon}
                            {platform.name}
                        </button>
                    ))}
                    
                    {typeof navigator.share !== "undefined" && (
                        <button
                            onClick={() => handleSocialShare("native")}
                            className="col-span-2 flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all duration-200"
                        >
                            <Globe className="w-5 h-5" />
                            More Sharing Options
                        </button>
                    )}
                </div>

                <div className="relative mt-2">
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <label htmlFor="link" className="sr-only">Link</label>
                            <Input
                                id="link"
                                defaultValue={shareUrl}
                                readOnly
                                className="h-11 bg-slate-50 border-slate-200 focus:ring-emerald-500 rounded-xl font-medium text-xs text-slate-500"
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => copyToClipboard()}
                            className={`h-11 px-4 rounded-xl transition-all duration-300 ${
                                copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white font-bold shrink-0 shadow-md`}
                        >
                            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareInventoryButton;
