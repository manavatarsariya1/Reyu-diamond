import { useState } from "react";
import  {  BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import {  ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { BidStatusBadge } from "./BidStatusBadge";
import { Check, X, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SellerBidPanelProps {
    listing: DiamondListing;
    bids: Bid[];
    onAcceptBid: (bidId: string) => Promise<void>;
    onRejectBid: (bidId: string) => Promise<void>;
}

export function SellerBidPanel({ listing, bids, onAcceptBid, onRejectBid }: SellerBidPanelProps) {
    const isLocked = listing.status === ListingStatus.LOCKED || listing.status === ListingStatus.SOLD;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Incoming Bids ({bids.length})</h3>
                {isLocked && (
                    <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Listing Locked
                    </span>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {bids.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No bids yet.
                    </div>
                ) : (
                    bids.map((bid) => (
                        <div key={bid.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {bid.bidderName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(bid.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatCurrency(bid.amount)}
                                    </span>
                                    {bid.note && (
                                        <span className="text-xs text-gray-500 italic truncate max-w-[200px]">
                                            "{bid.note}"
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <BidStatusBadge status={bid.status} />

                                {!isLocked && bid.status === BidStatus.PENDING && (
                                    <div className="flex gap-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Accept Bid?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will accept the bid of <strong>{formatCurrency(bid.amount)}</strong> from {bid.bidderName}.
                                                        The listing will be locked and other pending bids will be automatically rejected.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onAcceptBid(bid.id)}>
                                                        Confirm Acceptance
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full"
                                            onClick={() => onRejectBid(bid.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
