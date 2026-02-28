import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DiamondListing } from "@/types/listing";
import { toast } from "sonner";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { string } from "zod";

interface BidModalProps {
    listing: DiamondListing;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => Promise<void>;
}

export function BidModal({ listing, isOpen, onClose, onSubmit }: BidModalProps) {
    const allAuctions = useSelector((state: RootState) => state.auction.items);

    const [amount, setAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Find the auction for this listing
    // Was using filter with !== which returned every OTHER auction except this one
   
    const auctionDetails = allAuctions?.find(
        (item) => item.inventoryId._id === listing.id
    );

    console.log(auctionDetails, "auctiondetail")

    const highestBid = auctionDetails?.highestBidPrice ?? 0;
    const basePrice  = auctionDetails?.basePrice ?? 0;

    // Bid must beat highestBidPrice if exists, otherwise basePrice
    const minRequired = highestBid > 0 ? highestBid : basePrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const bidAmount = parseFloat(amount);

        if (isNaN(bidAmount) || bidAmount <= 0) {
            setError("Please enter a valid bid amount.");
            return;
        }

        // ── Must exceed highestBidPrice ────────────────────────────────────────
        if (bidAmount <= minRequired) {
            setError(
                highestBid > 0
                    ? `Bid must be greater than the current highest bid of $${highestBid.toLocaleString()}`
                    : `Bid must be greater than the base price of $${basePrice.toLocaleString()}`
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(bidAmount);
            toast.success("Bid placed successfully!");
            onClose();
            setAmount("");
        } catch (err) {
            console.error(err);
            setError("Failed to place bid. Please try again.");
            toast.error("Failed to place bid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Place a Bid</DialogTitle>
                    <DialogDescription>
                        You are placing a bid on{" "}
                        <span className="font-semibold text-gray-900">
                            {listing.carat}ct {listing.shape} {listing.color} {listing.clarity}
                        </span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    {/* Auction info summary */}
                    {auctionDetails && (
                        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm border border-gray-100">
                            <div className="flex justify-between text-gray-500">
                                <span>Base price</span>
                                <span className="font-semibold text-gray-800">
                                    ${basePrice.toLocaleString()}
                                </span>
                            </div>
                            {highestBid > 0 && (
                                <div className="flex justify-between text-gray-500">
                                    <span>Current highest bid</span>
                                    <span className="font-semibold text-indigo-600">
                                        ${highestBid.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold">
                                <span className="text-gray-700">Your bid must exceed</span>
                                <span className="text-indigo-700">${minRequired.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Bid Amount (USD)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-9"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                                disabled={isSubmitting}
                                min={minRequired + 1}
                                step="any"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !amount}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Placing Bid...
                                </>
                            ) : (
                                "Confirm Bid"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}