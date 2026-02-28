import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { auctionService } from "@/api/auctionService";
import { bidService } from "@/api/bidService";
import { BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import { ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { SellerBidPanel } from "@/components/bids/SellerBidPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

export default function SellerDashboardPage() {
    const { user } = useSelector((state: RootState) => state.auth);

    const [listings, setListings] = useState<DiamondListing[]>([]);
    const [allBids, setAllBids] = useState<Record<string, Bid[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const userId = (user as any)?._id || user?.id;

    const fetchDashboardData = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // Fetch all auctions for this seller
            const sellerAuctions = await auctionService.getAuctions({ recipient: userId });
            const activeSellerAuctions = sellerAuctions.filter((a: any) =>
                a.status === "ACTIVE" || a.status === "CLOSED"
            );

            // Fetch bids for each auction and format listings
            const bidsMap: Record<string, Bid[]> = {};
            const fetchedListings: DiamondListing[] = [];

            for (const auction of activeSellerAuctions) {
                const inv = auction.inventoryId as any;

                fetchedListings.push({
                    id: auction._id, // Using auction._id as the primary identifier here to link with bids
                    sellerId: inv.sellerId,
                    sellerName: "You",
                    shape: inv.shape,
                    carat: inv.carat,
                    color: inv.color,
                    clarity: inv.clarity,
                    certification: inv.lab,
                    reportNumber: inv.barcode,
                    price: auction.highestBidPrice > 0 ? auction.highestBidPrice : auction.basePrice,
                    imageUrl: inv.images?.[0] || "",
                    location: inv.location,
                    status: auction.status === "CLOSED" ? ListingStatus.LOCKED : ListingStatus.ACTIVE,
                    createdAt: auction.startDate,
                    totalBids: auction.bidIds?.length || 0,
                    currentHighestBid: auction.highestBidPrice > 0 ? auction.highestBidPrice : undefined
                });

                try {
                    const auctionBids = await bidService.getAllBids(auction._id);
                    bidsMap[auction._id] = auctionBids;
                } catch (e) {
                    console.error("Failed to fetch bids for auction", auction._id);
                    bidsMap[auction._id] = [];
                }
            }

            setListings(fetchedListings);
            setAllBids(bidsMap);
        } catch (error) {
            toast.error("Failed to load dashboard data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    const handleAcceptBid = async (bidId: string) => {
        try {
            await bidService.updateBidStatus(bidId, BidStatus.ACCEPTED);
            toast.success("Bid accepted! Listing is now locked.");
            fetchDashboardData(); // Refresh UI
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to accept bid");
        }
    };

    const handleRejectBid = async (bidId: string) => {
        try {
            await bidService.updateBidStatus(bidId, BidStatus.REJECTED);
            toast.info("Bid rejected.");
            fetchDashboardData(); // Refresh UI
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to reject bid");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
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

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <span className="ml-2 text-purple-600 font-medium">Loading Dashboard...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {listings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No active listings</h3>
                                <p className="text-gray-500 mt-1">You don't have any active auctions right now.</p>
                            </div>
                        ) : (
                            listings.map(listing => (
                                <div key={listing.id} className="flex flex-col lg:flex-row gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                    {/* Listing Info */}
                                    <div className="lg:w-1/3 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {listing.carat}ct {listing.shape} Diamond
                                                </h3>
                                                <p className="text-sm text-gray-500">{listing.location}</p>
                                            </div>
                                            <Badge variant={listing.status === ListingStatus.ACTIVE ? 'default' : 'secondary'} className="ml-2">
                                                {listing.status}
                                            </Badge>
                                        </div>
                                        <div className="text-3xl font-bold text-indigo-600">
                                            ${(listing.price).toLocaleString()} <span className="text-sm font-normal text-gray-400">Current Price</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider font-medium mb-1">Report</span>
                                                <span className="font-semibold text-gray-900">{listing.reportNumber || 'N/A'}</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase tracking-wider font-medium mb-1">Clarity/Color</span>
                                                <span className="font-semibold text-gray-900">{listing.clarity} / {listing.color}</span>
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
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
