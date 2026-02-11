import type { Bid } from "@/types/bid";
import type { DiamondListing } from "@/types/listing";
import { BidStatusBadge } from "./BidStatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Diamond } from "lucide-react";
import { Link } from "react-router-dom";

interface BidCardProps {
    bid: Bid;
    listing: DiamondListing;
}

export function BidCard({ bid, listing }: BidCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <div className="h-24 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {listing.imageUrl ? (
                    <img
                        src={listing.imageUrl}
                        alt="Diamond"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Diamond className="h-8 w-8 text-gray-300" />
                )}
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-gray-900">
                            {listing.carat}ct {listing.shape} Diamond
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Listed by {listing.sellerName}
                        </p>
                    </div>
                    <BidStatusBadge status={bid.status} />
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Your Bid</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(bid.amount)}
                        </p>
                    </div>

                    <div className="space-y-1 text-right">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Date Placed</p>
                        <p className="text-sm font-medium text-gray-700">
                            {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center border-l border-gray-100 pl-4 ml-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link to={`/marketplace/${listing.id}`}>
                        <ExternalLink className="h-5 w-5 text-gray-400 hover:text-indigo-600" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
