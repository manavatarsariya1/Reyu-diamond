import { useState } from "react";
import {  ListingStatus } from "@/types/listing";
import {  DealStatus } from "@/types/deal";
import type { Deal } from "@/types/deal";
import type { DiamondListing } from "@/types/listing";
import {  BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { DealCard } from "@/components/deals/DealCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, ShieldCheck } from "lucide-react";

// Mock Data
const MOCK_DEALS: Deal[] = [
    {
        id: "d1",
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
            status: ListingStatus.SOLD,
            createdAt: new Date().toISOString(),
            totalBids: 3
        },
        acceptedBid: {
            id: "b1",
            listingId: "1",
            bidderId: "current-user",
            bidderName: "You",
            amount: 5000,
            status: BidStatus.ACCEPTED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        buyerId: "current-user",
        buyerName: "You",
        sellerId: "seller-123",
        sellerName: "Diamond Dealer A",
        status: DealStatus.SHIPPED,
        finalPrice: 5000,
        logistics: {
            paymentMethod: "Wire Transfer",
            paymentTransactionId: "TXN-99887766",
            escrowId: "ESC-112233",
            shippingCarrier: "Brinks",
            trackingNumber: "1Z999AA10123456784",
            estimatedDeliveryDate: "Oct 25, 2026"
        },
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        isDisputed: false,
        hasDocuments: true
    },
    {
        id: "d2",
        listing: {
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
            status: ListingStatus.LOCKED,
            createdAt: new Date().toISOString(),
            totalBids: 2
        },
        acceptedBid: {
            id: "b_inc_1",
            listingId: "4",
            bidderId: "bidder-1",
            bidderName: "Bidder #492",
            amount: 3000,
            status: BidStatus.ACCEPTED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        buyerId: "bidder-1",
        buyerName: "Bidder #492",
        sellerId: "current-user",
        sellerName: "You",
        status: DealStatus.IN_ESCROW,
        finalPrice: 3000,
        logistics: {
            escrowId: "ESC-445566",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDisputed: false,
        hasDocuments: false
    }
];

export default function DealDashboardPage() {
    const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Filter Logic
    const filteredDeals = deals.filter(deal => {
        const matchesSearch = deal.id.includes(searchQuery) ||
            deal.listing.shape.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === "all") return true;
        if (activeTab === "active") return ![DealStatus.COMPLETED, DealStatus.CANCELLED].includes(deal.status);
        if (activeTab === "completed") return deal.status === DealStatus.COMPLETED;

        return true;
    });

    return (
        <div className="space-y-6 container mx-auto py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Deals & Transactions</h1>
                        <p className="text-muted-foreground">Manage your secure diamond acquisitions and sales.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search deals..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Deals</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 space-y-4">
                    {filteredDeals.length > 0 ? (
                        filteredDeals.map((deal) => (
                            <DealCard key={deal.id} deal={deal} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">No deals found</h3>
                            <p className="text-gray-500">No transactions match your current filters.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
