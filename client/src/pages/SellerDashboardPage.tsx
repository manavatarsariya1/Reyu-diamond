import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { auctionService } from "@/api/auctionService";
import { bidService } from "@/api/bidService";
import { inventoryService } from "@/api/inventoryService";
import { createDealRequest } from "@/features/deal/dealSlice";
import { BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import { ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { SellerBidPanel } from "@/components/bids/SellerBidPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Plus, Loader2, Package, Clock, Share2 } from "lucide-react";
import ShareInventoryButton from "@/components/inventory/ShareInventoryButton";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

interface PopulatedAuction {
    _id: string;
    status: string;
    startDate: string;
    highestBidPrice: number;
    basePrice: number;
    bidIds?: string[];
    inventoryId: {
        sellerId: string;
        shape: string;
        carat: number;
        color: string;
        clarity: string;
        lab: string;
        barcode: string;
        images?: string[];
        location: string;
    }
}

export default function SellerDashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    const [listings, setListings] = useState<DiamondListing[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [allBids, setAllBids] = useState<Record<string, Bid[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const userId = user?.id || user?._id || "";

    const fetchDashboardData = async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        console.log("Fetching dashboard data for user", userId);
        try {
            // Fetch all auctions for this seller
            const sellerAuctions = await auctionService.getAuctions({ recipient: userId });
            const activeSellerAuctions = sellerAuctions.filter((a) =>
                a.status === "ACTIVE" || a.status === "CLOSED"
            ) as unknown as PopulatedAuction[];

            // Fetch all inventory for this seller using the new filter
            try {
                const sellerInventory = await inventoryService.fetchInventories({ sellerId: userId });
                setInventory(sellerInventory.filter(item => item.status === "AVAILABLE" || item.status === "LISTED"));
            } catch (invError) {
                console.error("Failed to fetch seller inventory", invError);
            }

            // Fetch bids for each auction and format listings
            const bidsMap: Record<string, Bid[]> = {};
            const fetchedListings: DiamondListing[] = [];

            for (const auction of activeSellerAuctions) {
                const inv = auction.inventoryId;

                // Defensive check: if inventoryId is not populated or null
                if (!inv || typeof inv === "string") {
                    console.warn(`Auction ${auction._id} has unpopulated inventoryId`, inv);
                    continue;
                }

                fetchedListings.push({
                    id: auction._id,
                    sellerId: inv.sellerId,
                    sellerName: "You",
                    shape: inv.shape as any,
                    carat: inv.carat,
                    color: inv.color as any,
                    clarity: inv.clarity as any,
                    certification: inv.lab as any,
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
                } catch {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleAcceptBid = async (bidId: string) => {
        try {
            await bidService.updateBidStatus(bidId, BidStatus.ACCEPTED);

            // Dispatch Redux Action to create deal
            dispatch(createDealRequest(bidId));

            fetchDashboardData(); // Refresh UI
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || "Failed to accept bid or create deal");
            console.error("Deal creation error:", error);
        }
    };

    const handleRejectBid = async (bidId: string) => {
        try {
            await bidService.updateBidStatus(bidId, BidStatus.REJECTED);
            toast.info("Bid rejected.");
            fetchDashboardData(); // Refresh UI
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || "Failed to reject bid");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
        
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
                    <div className="space-y-10">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Inventory</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{inventory.length} Items</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Active Auctions</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === ListingStatus.ACTIVE).length}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Bids Received</p>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {Object.values(allBids).reduce((acc, current) => acc + current.length, 0)}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Active Auctions Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Store className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Active Auctions & Bids</h2>
                            </div>
                            
                            {listings.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500">No active auctions right now.</p>
                                    <Button variant="link" asChild>
                                        <Link to="/inventory">View Inventory to Start Auction</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {listings.map(listing => (
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
                                                <ShareInventoryButton 
                                                    inventoryId={listing.id} 
                                                    title={`${listing.carat}ct ${listing.shape}`}
                                                    className="w-full mt-4 h-12"
                                                />
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
                            )}
                        </section>

                        {/* Recent Inventory Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Package className="w-5 h-5 text-emerald-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Available Inventory</h2>
                            </div>
                            
                            {inventory.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500">No available inventory items found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {inventory.slice(0, 6).map(item => (
                                        <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.images?.[0] ? (
                                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{item.carat}ct {item.shape}</h4>
                                                <p className="text-xs text-gray-500 truncate">{item.barcode}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-bold text-indigo-600">${item.price.toLocaleString()}</span>
                                                    <Link 
                                                        to={item.status === 'AVAILABLE' ? '/inventory' : `/marketplace/${item._id}`}
                                                        className="text-xs text-blue-600 hover:underline font-medium"
                                                    >
                                                        Details
                                                    </Link>
                                                    <ShareInventoryButton 
                                                        inventoryId={item._id} 
                                                        title={`${item.carat}ct ${item.shape}`}
                                                        className="h-8 px-2 py-0 min-w-0 border-none bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                    {inventory.length > 6 && (
                                        <Link to="/inventory" className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors group">
                                            <span className="font-medium group-hover:text-gray-900">View all {inventory.length} items</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
