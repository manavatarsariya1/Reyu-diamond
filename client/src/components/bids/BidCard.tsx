import type { Bid } from "@/types/bid";
import { Link } from "react-router-dom";
import { ExternalLink, TrendingUp, Clock, Crown, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BidCardProps {
    bid: Bid;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    SUBMITTED: { label: "Submitted", dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    ACCEPTED: { label: "Accepted", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    REJECTED: { label: "Rejected", dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50 border-red-200" },
    WITHDRAWN: { label: "Withdrawn", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
    WINNING: { label: "Winning", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const fmt = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
});

export function BidCard({ bid }: BidCardProps) {
    const status = STATUS_CONFIG[bid.status] ?? STATUS_CONFIG.SUBMITTED;
    const date = new Date(bid.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
    const time = new Date(bid.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });

    const auction = bid.auctionId as any;
    const inventory = auction?.inventoryId;
    const diamondImage = inventory?.images?.[0];
    const diamondTitle = inventory ? `${inventory.carat}ct ${inventory.shape}` : `Auction #${(auction?._id || auction || "").toString().slice(-8).toUpperCase()}`;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

            {/* Gold accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-5 flex flex-col md:flex-row items-center gap-5">

                {/* Left: Diamond Image / Gavel icon block */}
                <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                    {diamondImage ? (
                        <img src={diamondImage} alt={diamondTitle} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                        <Diamond className="w-8 h-8 text-gray-300" />
                    )}
                    {/* Highest bid crown */}
                    {/* @ts-ignore */}
                    {bid?.isHighestBid && (
                        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                            <Crown className="w-3.5 h-3.5 text-white" />
                        </div>
                    )}
                </div>

                {/* Center: Info */}
                <div className="flex-grow min-w-0 space-y-3 w-full">

                    {/* Top row: title + status */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                Diamond Auction
                            </p>
                            <p className="text-lg font-bold text-gray-900 truncate">
                                {diamondTitle}
                            </p>
                        </div>

                        {/* Status badge */}
                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${bid.status === "SUBMITTED" ? "animate-pulse" : ""}`} />
                            {status.label}
                        </span>
                    </div>

                    {/* Bid amount + highest badge */}
                    <div className="flex items-end gap-3">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Your Bid</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">
                                {fmt.format(bid.bidAmount)}
                            </p>
                        </div>
                        {/* @ts-ignore */}
                        {bid.isHighestBid && (
                            <span className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                                <TrendingUp className="w-2.5 h-2.5" />
                                Highest Bid
                            </span>
                        )}
                    </div>

                    {/* Date / time row */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{date} · {time}</span>
                    </div>
                </div>

                {/* Right: Link action */}
                <div className="flex-shrink-0 flex items-center self-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <Link to={`/marketplace/${inventory?._id || auction?._id}`}>
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Bottom: subtle gradient fill when highest bid */}
            {/* @ts-ignore */}
            {bid.isHighestBid && (
                <div className="h-1 bg-gradient-to-r from-amber-300 via-[#c9a96e] to-amber-300 opacity-60" />
            )}
        </div>
    );
}