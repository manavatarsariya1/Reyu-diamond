import { useState } from "react";
import { ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { ListingCard } from "@/components/bids/ListingCard";
import { BidModal } from "@/components/bids/BidModal";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";

// Mock Data Area
const MOCK_LISTINGS: DiamondListing[] = [
    {
        id: "1",
        sellerId: "seller-123",
        sellerName: "Diamond Dealer A",
        shape: DiamondShape.ROUND,
        carat: 1.02,
        color: DiamondColor.F,
        clarity: DiamondClarity.VS1,
        certification: DiamondCertification.GIA,
        reportNumber: "GIA-123456",
        price: 5200,
        minBidAmount: 4800,
        imageUrl: "https://images.unsplash.com/photo-1615655114865-4cc1bda5901e?q=80&w=1000&auto=format&fit=crop",
        location: "New York, NY",
        status: ListingStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        totalBids: 3,
        currentHighestBid: 5000
    },
    {
        id: "2",
        sellerId: "seller-456",
        sellerName: "Luxury Gems Inc",
        shape: DiamondShape.OVAL,
        carat: 2.15,
        color: DiamondColor.D,
        clarity: DiamondClarity.VVS2,
        certification: DiamondCertification.IGI,
        reportNumber: "IGI-987654",
        price: 15400,
        minBidAmount: 14500,
        imageUrl: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop",
        location: "Antwerp, BE",
        status: ListingStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        totalBids: 0
    },
    {
        id: "3",
        sellerId: "seller-789",
        sellerName: "Private Seller",
        shape: DiamondShape.EMERALD,
        carat: 1.50,
        color: DiamondColor.H,
        clarity: DiamondClarity.VS2,
        certification: DiamondCertification.GIA,
        reportNumber: "GIA-555555",
        price: 6800,
        imageUrl: "https://images.unsplash.com/photo-1600869009498-8d429f88d4f5?q=80&w=1000&auto=format&fit=crop",
        location: "Tel Aviv, IL",
        status: ListingStatus.LOCKED,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        totalBids: 5,
        currentHighestBid: 6900
    },
    {
        id: "4",
        sellerId: "current-user", // Simulate user's own listing
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

export default function MarketplacePage() {
    // State
    const [listings, setListings] = useState<DiamondListing[]>(MOCK_LISTINGS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedListing, setSelectedListing] = useState<DiamondListing | null>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    // Mock User ID
    const currentUserId = "current-user";

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

    const handleSubmitBid = async (amount: number, note?: string) => {
        // Simulate API call
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                console.log(`Bid placed: $${amount} on ${selectedListing?.id} with note: ${note}`);
                resolve();
            }, 1000);
        });
    };

    return (
        <div className="gradient-luxury ">
            <Navbar />
            <div className="space-y-8 container mx-auto py-6 ">
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredListings.map(listing => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            isOwner={listing.sellerId === currentUserId}
                            onPlaceBid={handlePlaceBid}
                        />
                    ))}
                </div>

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
