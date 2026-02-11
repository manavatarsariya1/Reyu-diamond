import { useParams, Link } from "react-router-dom";
import {  ListingStatus } from "@/types/listing";
import {  DealStatus } from "@/types/deal";
import type { Deal } from "@/types/deal";
import type { DiamondListing } from "@/types/listing";
import {  BidStatus } from "@/types/bid";
import type { Bid } from "@/types/bid";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LifecycleTracker } from "@/components/deals/LifecycleTracker";
import ParticipantCard from "@/components/deals/ParticipantCard";
import { LogisticsPanel } from "@/components/deals/LogisticsPanel";
import { PDFAccessPanel } from "@/components/deals/PDFAccessPanel";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import { ArrowLeft, Diamond, MapPin, Clock } from "lucide-react";

// Mock Data (In real app, fetch by ID)
const MOCK_DEAL_DETAIL: Deal[] = [
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

export default function DealDetailsPage() {
    const { id } = useParams();
    const deal: Deal  = MOCK_DEAL_DETAIL.find((d : Deal) => d.id === id); // Find deal by ID

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="container mx-auto py-6 max-w-5xl space-y-8">
            {/* Header */}
            <div>
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link to="/deals">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Deals
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Deal #{deal.id}</h1>
                            <DealStatusBadge status={deal.status} />
                        </div>
                        <p className="text-gray-500">
                            Created on {new Date(deal.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lifecycle Tracker */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction Progress</h3>
                <LifecycleTracker currentStatus={deal.status} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Listing Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6">
                        <div className="h-32 w-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                                src={deal.listing.imageUrl}
                                alt="Diamond"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {deal.listing.carat}ct {deal.listing.shape} Diamond
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Diamond className="w-3.5 h-3.5" /> {deal.listing.color} / {deal.listing.clarity}</span>
                                <span>{deal.listing.certification}</span>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Final Price</span>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(deal.finalPrice)}</div>
                                </div>
                                <Badge variant="outline" className="bg-white">
                                    Listing Price: {formatCurrency(deal.listing.price)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Logistics */}
                    <LogisticsPanel logistics={deal.logistics} />

                    {/* Deal Docs */}
                    <PDFAccessPanel />
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {/* Participants */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Participants</h3>
                        <ParticipantCard
                            role="Buyer"
                            name={deal.buyerName}
                            id={deal.buyerId}
                        />
                        <ParticipantCard
                            role="Seller"
                            name={deal.sellerName}
                            id={deal.sellerId}
                        />
                    </div>

                    {/* Bid Notes */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            Contract Notes
                        </h4>
                        <p className="text-yellow-900 italic">
                            "{deal.acceptedBid.note || "No specific conditions attached."}"
                        </p>
                    </div>

                    {/* Help */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-center">
                        <p className="text-gray-500 mb-3">Need help with this transaction?</p>
                        <Button variant="outline" className="w-full bg-white">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
