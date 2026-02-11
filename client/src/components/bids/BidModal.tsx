import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DiamondListing } from "@/types/listing";
import { toast } from "sonner";
import { DollarSign, Loader2, AlertCircle } from "lucide-react";

interface BidModalProps {
    listing: DiamondListing;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, note?: string) => Promise<void>;
}

export function BidModal({ listing, isOpen, onClose, onSubmit }: BidModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const bidAmount = parseFloat(amount);

        // Validation
        if (isNaN(bidAmount) || bidAmount <= 0) {
            setError("Please enter a valid bid amount.");
            return;
        }

        if (listing.minBidAmount && bidAmount < listing.minBidAmount) {
            setError(`Minimum bid amount is $${listing.minBidAmount.toLocaleString()}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(bidAmount, note);
            toast.success("Bid placed successfully!");
            onClose();
            // Reset form
            setAmount("");
            setNote("");
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
                        You are placing a bid on <span className="font-semibold text-gray-900">{listing.carat}ct {listing.shape} {listing.color} {listing.clarity}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isSubmitting}
                                min={listing.minBidAmount || 0}
                            />
                        </div>
                        {listing.minBidAmount && (
                            <p className="text-xs text-muted-foreground">
                                Minimum bid: ${listing.minBidAmount.toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Note to Seller (Optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Add any conditions or questions..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isSubmitting}
                            className="resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            <AlertCircle className="h-4 w-4" />
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
