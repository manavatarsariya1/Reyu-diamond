import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Diamond, ArrowLeft, ShieldCheck, MapPin,
    Award, Info, Sparkles, Crown, Gavel, Clock,
    TrendingUp, Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { BidModal } from "@/components/bids/BidModal";
import { toast } from "sonner";
import { inventoryService } from "@/api/inventoryService";
import { auctionService } from "@/api/auctionService";
import { bidService } from "@/api/bidService";
import type { InventoryItem } from "@/types/inventory";
import type { Auction } from "@/types/auction";

export default function ListingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);
    const currentUserId = (user as any)?._id || user?.id;

    // ── Local state for data ──────────────────────────────────────────────────
    const [listing, setListing] = useState<InventoryItem | null>(null);
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isHighestBidFromCurrentUser, setIsHighestBidFromCurrentUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // 1. Fetch listing details
                const fetchedListing = await inventoryService.getInventoryById(id);
                setListing(fetchedListing);

                // 2. Fetch auctions
                const auctionsResponse = await auctionService.getAuctions();
                const activeAuction = auctionsResponse.find((a) => {
                    const invId = typeof a.inventoryId === "object" ? (a.inventoryId as any)?._id : a.inventoryId;
                    return invId === id && a.status === "ACTIVE";
                });

                if (activeAuction) {
                    setAuction(activeAuction);

                    // 3. Fetch user's bid
                    if (currentUserId) {
                        if (activeAuction.highestBidderId === currentUserId) {
                            setIsHighestBidFromCurrentUser(true);
                        } else {
                            try {
                                const myHighestBid = await bidService.getMyBid(activeAuction._id);
                                if (myHighestBid && myHighestBid.bidAmount === activeAuction.highestBidPrice) {
                                    setIsHighestBidFromCurrentUser(true);
                                }
                            } catch (err) {
                                // Ignored: user hasn't bid or 404
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch listing details", err);
                toast.error("Failed to fetch listing details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, currentUserId]);

    // ── Derived flags ─────────────────────────────────────────────────────────
    const isOwner = !!currentUserId && listing?.sellerId === currentUserId;
    const isAvailable = listing?.status === "LISTED" || listing?.status === "AVAILABLE";
    const isAuctionActive = auction?.status === "ACTIVE";

    const timeLeft = auction ? (() => {
        const diff = new Date(auction.endDate).getTime() - Date.now();
        if (diff <= 0) return "Ended";
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${d}d · ${h}h · ${m}m`;
    })() : null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50/50">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50/50">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Info className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Listing Not Found</h2>
                    <p className="text-gray-500 mb-8 max-w-md text-lg">
                        The diamond you are looking for has been removed, sold, or does not exist.
                    </p>
                    <Button asChild size="lg" className="px-8 rounded-full">
                        <Link to="/marketplace">Return to Collection</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const fmt = new Intl.NumberFormat("en-US", {
        style: "currency", currency: listing.currency || "USD", minimumFractionDigits: 0,
    });

    const handleSubmitBid = async (amount: number) => {
        if (!auction) {
            toast.error("Active auction not found for this listing.");
            throw new Error("No active auction");
        }
        try {
            await bidService.createBid(auction._id, { bidAmount: amount });

            // Manual local state update for fast UI feel
            setAuction({
                ...auction,
                highestBidPrice: amount,
                bidIds: auction.bidIds ? [...auction.bidIds, "temp_id"] : ["temp_id"]
            });
            setIsHighestBidFromCurrentUser(true);
            setIsBidModalOpen(false);
            toast.success("Bid placed successfully!");

            // Keep Redux in sync just in case
            dispatch({
                type: "bid/createBidStart",
                payload: { auctionId: auction._id, payload: { bidAmount: amount } },
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Failed to place bid");
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* ── Sticky top nav ────────────────────────────────────────────── */}
            <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                    <Link to="/marketplace" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Collection
                    </Link>
                    <div className="flex items-center gap-3">
                        {isOwner && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Crown className="w-3 h-3" /> Your Listing
                            </Badge>
                        )}
                        <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${isAvailable ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-gray-200 text-gray-600 bg-gray-50"}`}>
                            {listing.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-6xl px-4 py-10 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* ── Left: Image ───────────────────────────────────────── */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="aspect-[4/5] sm:aspect-square md:aspect-[4/3] lg:aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group">
                            {listing.images?.length > 0 ? (
                                <img src={listing.images[0]} alt={`${listing.carat}ct ${listing.shape}`} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <Diamond className="w-24 h-24 text-gray-300 stroke-[1px] mb-4" />
                                    <span className="text-gray-400 font-medium tracking-wide">Image Not Available</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-bold text-gray-900 tracking-tight">Verified Authentic</span>
                                </div>
                            </div>
                            {isOwner && (
                                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                                    <Crown className="w-3.5 h-3.5" /> Your Item
                                </div>
                            )}
                        </div>

                        {listing.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {listing.images.map((img, idx) => (
                                    <button key={idx} className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-colors">
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Details ────────────────────────────────────── */}
                    <div className="lg:col-span-5 flex flex-col">
                        <div className="sticky top-28 space-y-8">

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold px-3 py-1 text-xs uppercase tracking-wider rounded-md">Premium Diamond</Badge>
                                    <span className="text-sm text-gray-400 flex items-center gap-1 font-medium">
                                        <MapPin className="w-4 h-4" />{listing.location || "Global Vault"}
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                    {listing.carat} Carat {listing.shape} Cut
                                </h1>
                                <p className="text-base text-gray-500 leading-relaxed">
                                    {`A brilliant ${listing.carat} carat ${listing.shape} diamond, graded ${listing.color} color and ${listing.clarity} clarity.`}
                                </p>
                            </div>

                            <div className="h-px bg-gray-100 w-full" />

                            {/* ── Auction / Buy panel ──────────────────────── */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-7 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-5 opacity-[0.04]"><Diamond className="w-28 h-28" /></div>
                                <div className="relative z-10">
                                    {auction && (
                                        <>
                                            <div className="flex justify-between items-center mb-5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-widest">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                    {isAuctionActive ? "Live Auction" : "Auction Ended"}
                                                </div>
                                                {timeLeft && (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                                        <Clock className="w-3.5 h-3.5" />{timeLeft}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-6 space-y-2">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    {auction.highestBidPrice > auction.basePrice ? "Current Highest Bid" : "Starting Bid"}
                                                </div>
                                                <div className="text-5xl font-black text-gray-900 tracking-tighter flex items-baseline gap-2">
                                                    {fmt.format(auction.highestBidPrice > auction.basePrice ? auction.highestBidPrice : auction.basePrice)}
                                                    <span className="text-lg text-gray-400 font-medium">{listing.currency}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Base price: {fmt.format(auction.basePrice)} · {auction.bidIds?.length || 0} bid{auction.bidIds?.length !== 1 ? "s" : ""}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 mb-5 border border-gray-100">
                                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>
                                                    {new Date(auction.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    {" → "}
                                                    {new Date(auction.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>

                                            {isOwner ? (
                                                <div className="w-full h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-700 font-semibold text-sm">
                                                    <Crown className="w-4 h-4" /> You own this listing — bidding disabled
                                                </div>

                                            ) : isHighestBidFromCurrentUser ? (
                                                <div className="w-full h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
                                                    <TrendingUp className="w-4 h-4" /> Your bid is currently the highest
                                                </div>

                                            ) : (
                                                <Button size="lg" className="w-full text-base h-14 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 font-semibold tracking-wide flex items-center gap-2"
                                                    disabled={!isAuctionActive || !isAvailable} onClick={() => setIsBidModalOpen(true)}>
                                                    <Gavel className="w-5 h-5" />
                                                    {isAuctionActive ? "Place Bid" : "Auction Ended"}
                                                </Button>
                                            )}
                                            <p className="text-center text-sm text-gray-400 font-medium pt-3 flex items-center justify-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Bidding Environment
                                            </p>
                                        </>
                                    )
                                        // (
                                        //     <>
                                        //         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Buy It Now</div>
                                        //         <div className="text-5xl font-black text-gray-900 tracking-tighter mb-6 flex items-baseline gap-2">
                                        //             {fmt.format(listing.price)}
                                        //             <span className="text-xl text-gray-400 font-medium">{listing.currency}</span>
                                        //         </div>
                                        //         {isOwner ? (
                                        //             <div className="w-full h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-700 font-semibold text-sm mb-3">
                                        //                 <Crown className="w-4 h-4" /> You own this listing
                                        //             </div>
                                        //         ) : (
                                        //             <div className="space-y-3">
                                        //                 <Button size="lg" className="w-full text-base h-14 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 font-semibold" disabled={!isAvailable}>
                                        //                     {isAvailable ? "Secure Purchase" : "Currently Unavailable"}
                                        //                 </Button>
                                        //                 {isAvailable && (
                                        //                     <Button variant="outline" size="lg" className="w-full text-base h-14 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-gray-700">
                                        //                         Submit Offer
                                        //                     </Button>
                                        //                 )}
                                        //             </div>
                                        //         )}
                                        //         <p className="text-center text-sm text-gray-400 font-medium pt-3 flex items-center justify-center gap-2">
                                        //             <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fully Insured Global Shipping Included
                                        //         </p>
                                        //     </>
                                        // )
                                    }
                                </div>
                            </div>

                            {/* ── Spec grid ────────────────────────────────── */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" /> Diamond Specifications
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Color Grade", value: listing.color },
                                        { label: "Clarity", value: listing.clarity },
                                        { label: "Cut Grade", value: listing.cut || "EXCELLENT" },
                                        { label: "Carat Weight", value: String(listing.carat) },
                                        { label: "Shape", value: listing.shape },
                                        { label: "Lab", value: listing.lab || "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
                                            <div className="text-xl font-black text-gray-900">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Certification card ────────────────────────── */}
                            <div className="bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500 rounded-full blur-[80px] opacity-20" />
                                <div className="relative z-10 space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Award className="w-5 h-5 text-indigo-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-white mb-1">Certified by {listing.lab}</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                This diamond includes a gemological report verifying its specifications, origin, and authenticity.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Report / Barcode</div>
                                            <div className="font-mono text-base font-bold text-indigo-300 tracking-wider truncate">{listing.barcode}</div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="shrink-0 text-white hover:text-indigo-900 hover:bg-white border border-white/20">Verify</Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* ── Bid Modal ─────────────────────────────────────────────────── */}
            <BidModal
                listing={{
                    id: listing._id,
                    sellerId: listing.sellerId,
                    sellerName: "Verified Seller",
                    shape: listing.shape as any,
                    carat: listing.carat,
                    color: listing.color as any,
                    clarity: listing.clarity as any,
                    certification: listing.lab as any,
                    reportNumber: listing.barcode,
                    price: auction?.highestBidPrice > 0 ? auction.highestBidPrice : auction?.basePrice ?? listing.price,
                    minBidAmount: auction?.basePrice ?? listing.price * 0.9,
                    imageUrl: listing.images?.[0] || "",
                    location: listing.location,
                    status: listing.status as any,
                    createdAt: listing.createdAt,
                    totalBids: auction?.bidIds?.length || 0,
                    currentHighestBid: auction?.highestBidPrice > 0 ? auction.highestBidPrice : undefined,
                }}
                isOpen={isBidModalOpen}
                onClose={() => setIsBidModalOpen(false)}
                onSubmit={handleSubmitBid}
            />
        </div>
    );
}