import type { Deal } from "@/types/deal";
import { DealStatusBadge } from "./DealStatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Diamond } from "lucide-react";
import { Link } from "react-router-dom";

interface DealCardProps {
    deal: Deal;
}


export function DealCard({ deal }: DealCardProps) {
    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    {deal.listing.imageUrl ? (
                        <img
                            src={deal.listing.imageUrl}
                            alt="Diamond"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Diamond className="h-6 w-6 text-gray-300" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 truncate pr-2">
                            {deal.listing.carat}ct {deal.listing.shape} Diamond
                        </h4>
                        <DealStatusBadge status={deal.status} />
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500">
                            Deal ID: <span className="font-mono text-xs text-gray-400">#{deal.id.substring(0, 8)}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(deal.finalPrice)}
                            </div>
                            <div className="text-xs text-gray-400">
                                Updated {new Date(deal.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="pl-2">
                    <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8">
                        <Link to={`/deals/${deal.id}`}>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
