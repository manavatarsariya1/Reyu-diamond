import {  ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond, Scale, Palette, Eye, Award, ExternalLink, Lock, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
    listing: DiamondListing;
    isOwner: boolean;
    onPlaceBid?: (listing: DiamondListing) => void;
}

export function ListingCard({ listing, isOwner, onPlaceBid }: ListingCardProps) {
    const isLocked = listing.status === ListingStatus.LOCKED;
    const isSold = listing.status === ListingStatus.SOLD;
    const isActive = listing.status === ListingStatus.ACTIVE;

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Thumbnail */}
            <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                {listing.imageUrl ? (
                    <img
                        src={listing.imageUrl}
                        alt={`${listing.carat}ct ${listing.shape} Diamond`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <Diamond className="h-16 w-16 text-gray-300" />
                )}

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {isOwner && (
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm">
                            Your Listing
                        </Badge>
                    )}

                    {isLocked && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 shadow-sm gap-1">
                            <Lock className="w-3 h-3" /> Locked
                        </Badge>
                    )}

                    {isSold && (
                        <Badge variant="destructive" className="shadow-sm">
                            Sold
                        </Badge>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        {formatCurrency(listing.price)}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-grow flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {listing.carat}ct {listing.shape} Diamond
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5" /> Listed {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {listing.totalBids > 0 && (
                        <div className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                            {listing.totalBids} bid{listing.totalBids !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <Palette className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Color</span>
                            <span className="text-sm font-bold text-gray-900">{listing.color}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Clarity</span>
                            <span className="text-sm font-bold text-gray-900">{listing.clarity}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <Award className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Cert</span>
                            <span className="text-sm font-bold text-gray-900">{listing.certification}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <Scale className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Shape</span>
                            <span className="text-sm font-bold text-gray-900 truncate">{listing.shape}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50"
                    asChild
                >
                    <Link to={`/marketplace/${listing.id}`}>
                        View Details
                    </Link>
                </Button>

                {!isOwner && isActive && (
                    <Button
                        className="flex-1 bg-gray-900 hover:bg-black text-white"
                        onClick={() => onPlaceBid?.(listing)}
                    >
                        Place Bid
                    </Button>
                )}
            </div>
        </div>
    );
}
