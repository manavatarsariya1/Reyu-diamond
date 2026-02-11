import { useParams, Link } from "react-router-dom";
import { ListingStatus } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond, ArrowLeft, ShieldCheck, MapPin, Scale, Gem, Clock } from "lucide-react";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference"; // Reusing these enums

// Mock Data (In a real app, fetch by ID)
const MOCK_LISTING = [{
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
    description: "A stunning brilliant round cut diamond with excellent cut, polish, and symmetry. Verified by GIA. Perfect for an engagement ring.",
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
]

export default function ListingDetailsPage() {
    const { id } = useParams();
    const listing = MOCK_LISTING.find(listing => listing.id === id); // Ignore ID for mock

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-2 transition-all">
                <Link to="/marketplace">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Marketplace
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                        <img
                            src={listing.imageUrl}
                            alt="Diamond"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-gray-900 hover:bg-white text-sm backdrop-blur-sm shadow-md border-0">
                                {listing.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                {listing.sellerName}
                            </span>
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {listing.location}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {listing.carat} Carat {listing.shape} Diamond
                        </h1>
                        <div className="text-4xl font-bold text-gray-900 mt-4">
                            ${listing.price.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Current Highest Bid: <span className="font-semibold text-gray-700">${listing.currentHighestBid?.toLocaleString()}</span>
                        </p>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Color</div>
                            <div className="text-lg font-bold text-gray-900">{listing.color}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Clarity</div>
                            <div className="text-lg font-bold text-gray-900">{listing.clarity}</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Cut</div>
                            <div className="text-lg font-bold text-gray-900">Excellent</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Cert</div>
                            <div className="text-lg font-bold text-gray-900">{listing.certification}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            GIA Report: {listing.reportNumber}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <Button size="lg" className="w-full text-lg h-12">
                            Place Bid
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            Minimum bid amount: ${listing.minBidAmount?.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
