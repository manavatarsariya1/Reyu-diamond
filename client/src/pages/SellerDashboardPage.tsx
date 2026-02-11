import { useState } from "react";
import  {  BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import {  ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { SellerBidPanel } from "@/components/bids/SellerBidPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Mock Data
const MOCK_SELLER_LISTINGS: DiamondListing[] = [
    {
        id: "4",
        sellerId: "current-user",
        sellerName: "You",
        shape: DiamondShape.PEAR,
        carat: 0.90,
        color: DiamondColor.E,
        clarity: DiamondClarity.SI1,
        certification: DiamondCertification.GIA,
        reportNumber: "GIA-11111",
        price: 3200,
        imageUrl: "",
        location: "Mumbai, IN",
        status: ListingStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        totalBids: 2,
        currentHighestBid: 3100
    }
];

const MOCK_INCOMING_BIDS: Record<string, Bid[]> = {
    "4": [
        {
            id: "b_inc_1",
            listingId: "4",
            bidderId: "bidder-1",
            bidderName: "Bidder #492",
            amount: 3000,
            status: BidStatus.PENDING,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            note: "Can you ship to Dubai?"
        },
        {
            id: "b_inc_2",
            listingId: "4",
            bidderId: "bidder-2",
            bidderName: "Bidder #881",
            amount: 3100,
            status: BidStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]
};

export default function SellerDashboardPage() {
    const [listings, setListings] = useState(MOCK_SELLER_LISTINGS);
    const [allBids, setAllBids] = useState(MOCK_INCOMING_BIDS);

    const handleAcceptBid = async (bidId: string) => {
        // Simulate API
        toast.success("Bid accepted! Listing is now locked.");
        // In a real app, this would refresh data
    };

    const handleRejectBid = async (bidId: string) => {
        toast.info("Bid rejected.");
        // In a real app, this would refresh data
    };

    return (
        <div className="space-y-8 container mx-auto py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Seller Dashboard</h1>
                        <p className="text-muted-foreground">Manage your listings and incoming offers.</p>
                    </div>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ml-auto md:ml-2" asChild>
                    <Link to="/inventory/add">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Inventory
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {listings.map(listing => (
                    <div key={listing.id} className="flex flex-col lg:flex-row gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        {/* Listing Info */}
                        <div className="lg:w-1/3 space-y-4">
                            <div className="flex items-start justify-between">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {listing.carat}ct {listing.shape} Diamond
                                </h3>
                                <Badge variant={listing.status === ListingStatus.ACTIVE ? 'default' : 'secondary'}>
                                    {listing.status}
                                </Badge>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">
                                ${(listing.price).toLocaleString()} <span className="text-sm font-normal text-gray-400">asking</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-gray-500 block text-xs">Report</span>
                                    <span className="font-medium">{listing.reportNumber}</span>
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                    <span className="text-gray-500 block text-xs">Clarity/Color</span>
                                    <span className="font-medium">{listing.clarity} / {listing.color}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bids Panel */}
                        <div className="lg:w-2/3">
                            <SellerBidPanel
                                listing={listing}
                                bids={allBids[listing.id] || []}
                                onAcceptBid={handleAcceptBid}
                                onRejectBid={handleRejectBid}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
