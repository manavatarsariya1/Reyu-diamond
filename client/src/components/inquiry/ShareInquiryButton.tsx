    import React from 'react';
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from 'react';

interface ShareInquiryButtonProps {
    inquiryId: string;
    carat: number;
    shape: string;
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

const ShareInquiryButton: React.FC<ShareInquiryButtonProps> = ({
    inquiryId,
    carat,
    shape,
    variant = "outline",
    size = "sm",
    className = ""
}) => {
    const [isCopied, setIsCopied] = useState(false);

    // The sharing link points to the backend SEO route which provides Opengraph meta tags
    // and then redirects the user to the frontend InquiryDetailsPage.
    const getShareUrl = () => {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, "");
        // ✅ Use the SEO route, not the frontend marketplace route
        return `${backendUrl}/api/inventory/seo/${inquiryId}?v=${Date.now()}`;
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = getShareUrl();
        const shareData = {
            title: `Diamond Inquiry: ${carat}ct ${shape}`,
            text: `Check out this diamond inquiry for a ${carat}ct ${shape} on Reyu Diamond.`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (err) {
            // User cancelled or share failed
            if ((err as Error).name !== 'AbortError') {
                console.error("Error sharing:", err);
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareUrl);
                setIsCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setIsCopied(false), 2000);
            }
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleShare}
            className={`rounded-xl h-9 px-4 font-semibold transition-all hover:shadow-md ${className}`}
        >
            {isCopied ? (
                <Check className="w-4 h-4 mr-2" />
            ) : (
                <Share2 className="w-4 h-4 mr-2" />
            )}
            {isCopied ? "Copied" : "Share"}
        </Button>
    );
};

export default ShareInquiryButton;
