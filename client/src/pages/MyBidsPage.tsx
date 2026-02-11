import { useState } from "react";
import {  BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import {  ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { BidCard } from "@/components/bids/BidCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";

// Mock Data
const MOCK_MY_BIDS: { bid: Bid, listing: DiamondListing }[] = [
    {
        bid: {
            id: "b1",
            listingId: "1",
            bidderId: "current-user",
            bidderName: "You",
            amount: 4900,
            status: BidStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        listing: {
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
            imageUrl: "https://images.unsplash.com/photo-1615655114865-4cc1bda5901e?q=80&w=1000&auto=format&fit=crop",
            location: "New York, NY",
            status: ListingStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            totalBids: 3,
            currentHighestBid: 5000
        }
    },
    {
        bid: {
            id: "b2",
            listingId: "3",
            bidderId: "current-user",
            bidderName: "You",
            amount: 6500,
            status: BidStatus.OUTBID,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        listing: {
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
        }
    }
];

export default function MyBidsPage() {
    const [bids] = useState(MOCK_MY_BIDS);
    const [activeTab, setActiveTab] = useState("all");

    const filteredBids = activeTab === "all"
        ? bids
        : bids.filter(item => item.bid.status.toLowerCase() === activeTab);

    return (
        <div className="space-y-6 container mx-auto py-6">
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
                    <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">Pending</TabsTrigger>
                    <TabsTrigger value="accepted" className="rounded-md data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Accepted</TabsTrigger>
                    <TabsTrigger value="outbid" className="rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Outbid</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 space-y-4">
                    {filteredBids.length > 0 ? (
                        filteredBids.map((item) => (
                            <BidCard
                                key={item.bid.id}
                                bid={item.bid}
                                listing={item.listing}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-gray-50/50">
                            <p className="text-gray-500 font-medium">No bids found in this category.</p>
                            <Button variant="link" className="mt-2 text-indigo-600">
                                Browse Marketplace
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
