import { useEffect, useState } from "react";
import type { Bid } from "@/types/bid";
import { BidCard } from "@/components/bids/BidCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { bidService } from "@/api/bidService";
import { toast } from "sonner";

export default function MyBidsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [myBids, setMyBids] = useState<Bid[]>([]);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchBids = async () => {
            setIsLoading(true);
            try {
                const bids = await bidService.getAllMyBids();
                setMyBids(bids);
            } catch (error) {
                toast.error("Failed to load your bids. Please try again.");
                console.error("Failed to fetch bids in MyBidsPage:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBids();
    }, []);

    // Map the backend bid data + populated inventory into the format BidCard expects
    // const bidsData: { bid: Bid, listing: DiamondListing }[] = myBids?.map(bidObj => {
    //     const inventory = bidObj.auctionId?.inventoryId || {};

    //     return {
    //         // bid: {
    //         //     id: bidObj._id,
    //         //     listingId: inventory._id,
    //         //     bidderId: bidObj.buyerId,
    //         //     bidderName: "You", // Self
    //         //     amount: bidObj.bidAmount,
    //         //     status: bidObj.status,
    //         //     createdAt: bidObj.createdAt,
    //         //     updatedAt: bidObj.updatedAt
    //         // } as Bid,
    //         listing: {
    //             id: inventory._id,
    //             sellerId: "N/A",  // Not strictly needed in MyBids view
    //             sellerName: "Seller",
    //             shape: inventory.shape as any,
    //             carat: inventory.carat,
    //             color: inventory.color as any,
    //             clarity: inventory.clarity as any,
    //             certification: inventory.lab as any,
    //             reportNumber: inventory.barcode,
    //             price: inventory.price,
    //             imageUrl: inventory.images?.[0] || "",
    //             location: inventory.location,
    //             status: inventory.status as any,
    //             createdAt: bidObj.auctionId?.startDate || inventory.createdAt,
    //             totalBids: bidObj.auctionId?.bidIds?.length || 0,
    //             currentHighestBid: bidObj.auctionId?.highestBidPrice
    //         } as DiamondListing
    //     };
    // });

    const filteredBids = activeTab === "all"
        ? myBids
        : myBids.filter(bid => bid.status.toLowerCase() === activeTab.toLowerCase());

    return (
        <div className="gradient-luxury">
            <Navbar />
            <div className="space-y-6 container mx-auto p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Bids</h1>
                        <p className="text-muted-foreground">Track the status of your offers.</p>
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="bg-white border text-gray-500 rounded-lg p-1 h-10 shadow-sm">
                        <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">All Bids</TabsTrigger>
                        <TabsTrigger value="rejected" className="rounded-md data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Rejected</TabsTrigger>
                        <TabsTrigger value="accepted" className="rounded-md data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Accepted</TabsTrigger>
                        <TabsTrigger value="outbid" className="rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Outbid</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6 space-y-4 max-w-300">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                <span className="ml-2 text-indigo-600 font-medium">Loading your bids...</span>
                            </div>
                        ) : filteredBids?.length > 0 ? (
                            filteredBids?.map((item) => (
                                <BidCard
                                    key={item._id}
                                    bid={item}
                                // listing={item.listing}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-gray-50/50">
                                <p className="text-gray-500 font-medium">No bids found in this category.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
