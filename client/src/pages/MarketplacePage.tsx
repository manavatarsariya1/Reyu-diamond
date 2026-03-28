import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoriesStart } from "@/features/inventory/inventorySlice";
import { fetchAuctionsStart } from "@/features/auction/auctionSlice";
import type { RootState } from "@/app/store";
import { ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { ListingCard } from "@/components/bids/ListingCard";
import { BidModal } from "@/components/bids/BidModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import AdCarousel from "@/components/ads/AdCarousel";

export default function MarketplacePage() {
    const dispatch = useDispatch();
    const inventoryItems = useSelector((state: RootState) => state.inventory.items);
    const auctions = useSelector((state: RootState) => state.auction.items);
    const isLoading = useSelector((state: RootState) => state.inventory.loading);
    const { user } = useSelector((state: RootState) => state.auth);
    // User auth context mapped optional, mocking for now as per old implementation
    // const user = useSelector((state: RootState) => state.auth?.user);

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedListing, setSelectedListing] = useState<DiamondListing | null>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchInventoriesStart());
        dispatch(fetchAuctionsStart());
    }, [dispatch]);

    // Mock User ID
    const currentUserId = user?._id;

    // Helper for countdown
    const calculateTimeLeft = (endDate: string | Date) => {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return "Ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d · ${hours}h · ${minutes}m`;
    };

    // Map active auctions to diamond listing type.
    const listings: DiamondListing[] = (auctions || [])
        .filter(auction => auction.status === "ACTIVE" && new Date(auction.endDate) > new Date())
        .map(auction => {
            const invId = typeof auction.inventoryId === "object" ? (auction.inventoryId as any)._id : auction.inventoryId;
            const inv = inventoryItems.find((i: any) => i._id === invId);
            
            if (!inv) return null;

            return {
                id: inv._id,
                sellerId: typeof inv.sellerId === "object" ? inv.sellerId._id : inv.sellerId,
                sellerName: (typeof inv.sellerId === "object" && inv.sellerId.username) || "Verified Seller",
                sellerRating: typeof inv.sellerId === "object" ? inv.sellerId.rating : undefined,
                sellerBadges: typeof inv.sellerId === "object" ? inv.sellerId.badges : undefined,
                shape: inv.shape as any,
                carat: inv.carat,
                color: inv.color as any,
                clarity: inv.clarity as any,
                certification: inv.lab as any,
                reportNumber: inv.barcode || "N/A",
                price: auction.highestBidPrice > 0 ? auction.highestBidPrice : auction.basePrice,
                minBidAmount: auction.basePrice,
                imageUrl: inv.images?.[0] || "",
                location: inv.location || "Global",
                status: ListingStatus.ACTIVE,
                createdAt: auction.startDate,
                timeLeft: calculateTimeLeft(auction.endDate),
                totalBids: auction.bidIds?.length || 0,
                currentHighestBid: auction.highestBidPrice > 0 ? auction.highestBidPrice : undefined
            } as DiamondListing;
        })
        .filter(l => l !== null) as DiamondListing[];


    // Filter Logic
    const filteredListings = listings.filter(listing =>
        listing.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.carat.toString().includes(searchQuery)
    );

    // Handlers
    const handlePlaceBid = (listing: DiamondListing) => {
        if (listing.sellerId === currentUserId) {
            toast.error("You cannot bid on your own listing.");
            return;
        }
        setSelectedListing(listing);
        setIsBidModalOpen(true);
    };

    const handleSubmitBid = (amount: number) => {
        return new Promise<void>((resolve, reject) => {
            if (!selectedListing) {
                reject(new Error("No listing selected"));
                return;
            }

            // Find the auction associated with this listing
            const auction = auctions.find(a => a.inventoryId === selectedListing.id && a.status === "ACTIVE");
            if (!auction) {
                toast.error("Active auction not found for this listing.");
                reject(new Error("No active auction"));
                return;
            }

            dispatch({
                type: "bid/createBidStart",
                payload: {
                    auctionId: auction._id,
                    payload: { bidAmount: amount }
                }
            });
            // We resolve immediately or you could watch Redux state for success tracking
            resolve();
        });
    };

    return (
        <div className="gradient-luxury ">
            <Navbar />
            <div className="space-y-12 container mx-auto py-8">
                <AdCarousel section="MARKETPLACE" />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
                        <p className="text-muted-foreground mt-1">Browse and bid on exclusive diamonds from verifying sellers.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <Button>
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Sort
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by shape, carat, or report number..."
                        className="pl-9 h-11 bg-white shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Listings Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-indigo-600 font-medium">Loading Marketplace...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredListings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing as any}
                                isOwner={listing.sellerId === currentUserId}
                                onPlaceBid={handlePlaceBid}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredListings.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No listings found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            Try adjusting your search or filters to find what you are looking for.
                        </p>
                    </div>
                )}

                {/* Modals */}
                {selectedListing && (
                    <BidModal
                        listing={selectedListing}
                        isOpen={isBidModalOpen}
                        onClose={() => setIsBidModalOpen(false)}
                        onSubmit={handleSubmitBid}
                    />
                )}
            </div>
        </div>
    );
}
