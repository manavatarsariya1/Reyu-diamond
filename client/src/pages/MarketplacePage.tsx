import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInventoriesStart } from "@/features/inventory/inventorySlice";
import { fetchAuctionsStart } from "@/features/auction/auctionSlice";
import type { RootState } from "@/app/store";
import { ListingStatus } from "@/types/listing";
import type { DiamondListing } from "@/types/listing";
import { ListingCard } from "@/components/bids/ListingCard";
import { BidModal } from "@/components/bids/BidModal";
import { Search, Filter, SlidersHorizontal, Loader2, Diamond } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import AdCarousel from "@/components/ads/AdCarousel";

export default function MarketplacePage() {
    const dispatch = useDispatch();
    const inventoryItems = useSelector((state: RootState) => state.inventory.items);
    const auctions = useSelector((state: RootState) => state.auction.items);
    const isLoading = useSelector((state: RootState) => state.inventory.loading);
    const { user } = useSelector((state: RootState) => state.auth);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedListing, setSelectedListing] = useState<DiamondListing | null>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchInventoriesStart());
        dispatch(fetchAuctionsStart());
    }, [dispatch]);

    const currentUserId = user?._id;

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

    const filteredListings = listings.filter(listing =>
        listing.shape.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.carat.toString().includes(searchQuery)
    );

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
            if (!selectedListing) { reject(new Error("No listing selected")); return; }
            const auction = auctions.find(a => a.inventoryId === selectedListing.id && a.status === "ACTIVE");
            if (!auction) { toast.error("Active auction not found."); reject(new Error("No active auction")); return; }
            dispatch({ type: "bid/createBidStart", payload: { auctionId: auction._id, payload: { bidAmount: amount } } });
            resolve();
        });
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                .mp { font-family:'DM Sans',sans-serif; background:#f0ede8; min-height:100vh; }

                .mp-hero {
                    background: #1c2e29;
                    padding: 48px 32px 0;
                    position: relative; overflow: hidden;
                }
                .mp-hero::after {
                    content:''; position:absolute; inset:0; pointer-events:none;
                    background: radial-gradient(ellipse at 75% 40%, rgba(45,122,107,0.22) 0%, transparent 55%),
                                radial-gradient(ellipse at 15% 90%, rgba(126,207,190,0.07) 0%, transparent 45%);
                }
                .mp-inner { max-width:1160px; margin:0 auto; position:relative; z-index:1; }

                .mp-live-tag {
                    display:inline-flex; align-items:center; gap:8px;
                    font-size:11px; font-weight:500; letter-spacing:0.13em; text-transform:uppercase; color:#7ecfbe;
                    margin-bottom:14px;
                }
                .mp-live-dot {
                    width:7px; height:7px; border-radius:50%; background:#7ecfbe;
                    animation: blink 2s ease-in-out infinite;
                }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

                .mp-h1 {
                    font-family:'Playfair Display',serif;
                    font-size:clamp(32px,4.5vw,50px); font-weight:400; line-height:1.1; color:#fff; margin:0 0 10px;
                }
                .mp-desc { font-size:14px; font-weight:300; color:#5a8078; }

                .mp-stats { display:flex; gap:12px; flex-wrap:wrap; }
                .mp-stat {
                    background:rgba(255,255,255,0.05); border:1px solid rgba(126,207,190,0.18);
                    border-radius:8px; padding:16px 22px; text-align:center; min-width:108px;
                }
                .mp-stat-n {
                    font-family:'Playfair Display',serif; font-size:30px; font-weight:400; color:#7ecfbe; line-height:1;
                }
                .mp-stat-l { font-size:11px; color:#3d6058; margin-top:5px; letter-spacing:0.05em; }

                .mp-search-bar {
                    display:flex; gap:10px; align-items:center; flex-wrap:wrap;
                    border-top:1px solid rgba(255,255,255,0.07);
                    margin-top:36px; padding:18px 0;
                }
                .mp-search-wrap { position:relative; flex:1; max-width:480px; min-width:180px; }
                .mp-input {
                    width:100%; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300;
                    background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.1);
                    border-radius:6px; padding:11px 16px 11px 40px; color:#e8f0ee; outline:none;
                    transition:border-color 0.2s;
                }
                .mp-input:focus { border-color:#2d7a6b; background:rgba(255,255,255,0.11); }
                .mp-input::placeholder { color:#3d6058; }
                .mp-si { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#3d6058; pointer-events:none; }

                .mp-btn-f {
                    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:400;
                    background:rgba(255,255,255,0.06); color:#9ec8c0;
                    border:1.5px solid rgba(255,255,255,0.1); padding:10px 18px; border-radius:6px;
                    cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:7px;
                }
                .mp-btn-f:hover { border-color:#2d7a6b; color:#7ecfbe; background:rgba(45,122,107,0.18); }

                .mp-btn-s {
                    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
                    background:#2d7a6b; color:#fff; border:none; padding:10px 18px; border-radius:6px;
                    cursor:pointer; transition:background 0.2s; display:inline-flex; align-items:center; gap:7px;
                }
                .mp-btn-s:hover { background:#235f54; }

                .mp-body { max-width:1160px; margin:0 auto; padding:36px 32px; }

                .mp-ad {
                    background:#fff; border:1px solid #e2ddd6; border-radius:10px;
                    padding:18px; margin-bottom:32px; overflow:hidden;
                }

                .mp-rl { font-size:13px; color:#999; margin-bottom:20px; }
                .mp-rl b { color:#2d7a6b; font-weight:500; }
                .mp-rl em { color:#555; font-style:normal; }

                .mp-grid {
                    display:grid;
                    grid-template-columns:repeat(auto-fill, minmax(268px,1fr));
                    gap:20px;
                }

                .mp-load { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 0; gap:14px; }
                @keyframes spin { to { transform:rotate(360deg); } }

                .mp-empty { text-align:center; padding:80px 0; }
                .mp-empty-ic {
                    width:64px; height:64px; border-radius:50%; background:#f0f7f5;
                    border:1px solid #cce5df; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;
                }
                .mp-clr {
                    font-family:'DM Sans',sans-serif; font-size:13px;
                    background:#fff; color:#2d7a6b; border:1.5px solid #b8d8d2;
                    padding:9px 20px; border-radius:6px; cursor:pointer; margin-top:18px; transition:all 0.2s;
                }
                .mp-clr:hover { background:#f0f7f5; }
            `}</style>

            <div className="mp">
                <Navbar />

                {/* DARK HERO */}
                <div className="mp-hero">
                    <div className="mp-inner">
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:28, marginBottom:0 }}>
                            <div>
                                <div className="mp-live-tag"><span className="mp-live-dot"/>Live Auctions</div>
                                <h1 className="mp-h1">Diamond <em style={{ color:"#7ecfbe", fontStyle:"italic" }}>Marketplace</em></h1>
                                <p className="mp-desc">Browse and bid on exclusive diamonds from verified sellers.</p>
                            </div>
                            <div className="mp-stats">
                                <div className="mp-stat">
                                    <div className="mp-stat-n">{listings.length}</div>
                                    <div className="mp-stat-l">Active Listings</div>
                                </div>
                                <div className="mp-stat">
                                    <div className="mp-stat-n">{listings.reduce((s,l) => s+(l.totalBids||0),0)}</div>
                                    <div className="mp-stat-l">Total Bids</div>
                                </div>
                                <div className="mp-stat">
                                    <div className="mp-stat-n">{listings.filter(l=>(l.totalBids||0)>0).length}</div>
                                    <div className="mp-stat-l">Active Bidding</div>
                                </div>
                            </div>
                        </div>

                        {/* search strip */}
                        <div className="mp-search-bar">
                            <div className="mp-search-wrap">
                                <Search size={14} className="mp-si"/>
                                <input className="mp-input" placeholder="Search by shape, carat, or report number..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                            </div>
                            <button className="mp-btn-f"><Filter size={14}/> Filters</button>
                            <button className="mp-btn-s"><SlidersHorizontal size={14}/> Sort</button>
                        </div>
                    </div>
                </div>

                {/* LIGHT BODY */}
                <div className="mp-body">
                    <div className="mp-ad"><AdCarousel section="MARKETPLACE"/></div>

                    {isLoading && (
                        <div className="mp-load">
                            <div style={{ width:52,height:52,borderRadius:"50%",background:"#f0f7f5",border:"1px solid #cce5df",display:"flex",alignItems:"center",justifyContent:"center" }}>
                                <Loader2 size={22} color="#2d7a6b" style={{ animation:"spin 1s linear infinite" }}/>
                            </div>
                            <span style={{ fontSize:14,color:"#999",fontWeight:300 }}>Loading marketplace...</span>
                        </div>
                    )}

                    {!isLoading && filteredListings.length > 0 && (
                        <p className="mp-rl">Showing <b>{filteredListings.length}</b> listing{filteredListings.length!==1?"s":""}{searchQuery&&<> for "<em>{searchQuery}</em>"</>}</p>
                    )}

                    {!isLoading && filteredListings.length > 0 && (
                        <div className="mp-grid">
                            {filteredListings.map(listing=>(
                                <ListingCard key={listing.id} listing={listing as any} isOwner={listing.sellerId===currentUserId} onPlaceBid={handlePlaceBid}/>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredListings.length === 0 && (
                        <div className="mp-empty">
                            <div className="mp-empty-ic"><Diamond size={26} color="#2d7a6b"/></div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:400,color:"#1a1a1a",marginBottom:8 }}>No listings found</h3>
                            <p style={{ fontSize:14,fontWeight:300,color:"#aaa",maxWidth:320,margin:"0 auto" }}>
                                {searchQuery?"Try adjusting your search or clearing the filters.":"No active auctions right now. Check back soon."}
                            </p>
                            {searchQuery && <button className="mp-clr" onClick={()=>setSearchQuery("")}>Clear search</button>}
                        </div>
                    )}
                </div>

                {selectedListing && (
                    <BidModal listing={selectedListing} isOpen={isBidModalOpen} onClose={()=>setIsBidModalOpen(false)} onSubmit={handleSubmitBid}/>
                )}
            </div>
        </>
    );
}