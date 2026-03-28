import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchDealByIdRequest } from "@/features/deal/dealSlice";
import { buyerConfirmDeliveryRequest, refundEscrowRequest } from "@/features/payment/paymentSlice";
import { Button } from "@/components/ui/button";
import { LifecycleTracker } from "@/components/deals/LifecycleTracker";
import { LogisticsPanel } from "@/components/deals/LogisticsPanel";
import { PDFAccessPanel } from "@/components/deals/PDFAccessPanel";
import { DealStatusBadge } from "@/components/deals/DealStatusBadge";
import {
    Gavel, Hash, CreditCard, CircleDollarSign, Package,
    Star, ArrowLeft, Diamond, Loader2, Clock, AlertTriangle,
    ExternalLink, ShieldCheck, FileText, CheckCircle2,
    Banknote, User, Mail, Calendar, TrendingUp
} from "lucide-react";
import { RatingSubmissionCard } from "@/components/reputation/RatingSubmissionCard";
import { ratingService } from "@/api/ratingService";
import { toast } from "sonner";

export default function DealDetailsPage() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { currentDeal: deal, isLoading } = useSelector((state: RootState) => state.deal);
    const { user } = useSelector((state: RootState) => state.auth);

    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchDealByIdRequest(id));
            
            // Check if already rated
            ratingService.checkRating(id).then(res => {
                if (res.success && res.rated) {
                    setIsRatingSubmitted(true);
                }
            }).catch(err => console.error("Error checking rating status:", err));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (!deal || (deal.status !== "PAYMENT_PENDING" && deal.status !== "CREATED")) return;
        const createdAtTime = new Date(deal.createdAt).getTime();
        const expiryTime = createdAtTime + 24 * 60 * 60 * 1000;
        const timer = setInterval(() => {
            const diff = expiryTime - Date.now();
            if (diff <= 0) {
                setTimeLeft("00h : 00m : 00s");
                setIsExpired(true);
                clearInterval(timer);
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [deal]);

    // ---------- Loading & Empty States ----------
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <span className="text-gray-500 font-semibold tracking-wide">Loading Escrow Ledger…</span>
                </div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl text-center max-w-sm">
                    <AlertTriangle className="w-14 h-14 text-rose-400 mx-auto mb-5" />
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Deal Not Found</h2>
                    <p className="text-gray-500 mb-8 text-sm">The deal you're looking for doesn't exist or you don't have access.</p>
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold">
                        <Link to="/deals">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ---------- Data extraction with safe access ----------
    const bid = deal.bidId as any;
    const auction = deal.auctionId as any;
    const inventory = typeof auction?.inventoryId === "object" ? auction.inventoryId : null;
    const buyer = deal.buyerId as any;
    const seller = deal.sellerId as any;
    const diamondImage = inventory?.images?.[0];

    const currentUserId = user?.id || (user as any)?._id;
    const isBuyer = (buyer?._id || buyer) === currentUserId;
    const isSeller = (seller?._id || seller) === currentUserId;

    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: deal.currency || "USD", maximumFractionDigits: 0 }).format(n);

    const fmtDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

    const fmtDateTime = (d: string) =>
        d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    // Status color helpers
    const handleRatingSubmit = async (score: number, feedback: string) => {
        try {
            setIsSubmittingRating(true);
            const response = await ratingService.createRating(deal._id as string, score, feedback);
            if (response.success) {
                setIsRatingSubmitted(true);
                toast.success("Thank you for your feedback!");
            }
        } catch (error: any) {
            console.error("Failed to submit rating:", error);
            toast.error(error.response?.data?.message || "Failed to submit rating");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // Status color helpers
    const statusColors: Record<string, string> = {
        CREATED: "bg-blue-500",
        PAYMENT_PENDING: "bg-amber-500",
        IN_ESCROW: "bg-emerald-500",
        SHIPPED: "bg-cyan-500",
        DELIVERED: "bg-teal-500",
        COMPLETED: "bg-green-600",
        DISPUTED: "bg-red-500",
        CANCELLED: "bg-gray-500",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 pb-20">

            {/* ─── Sticky Top Bar ─── */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
                    <Button variant="ghost" asChild className="pl-0 text-gray-500 hover:text-indigo-600 hover:bg-transparent transition-colors">
                        <Link to="/deals">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Deals
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8">

                {/* ─── Hero Banner ─── */}
                <div className="relative rounded-3xl overflow-hidden mb-8">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px]" />

                    <div className="relative px-8 py-10 md:px-12 md:py-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                    Deal <span className="text-indigo-400">#{deal._id?.slice(-8).toUpperCase()}</span>
                                </h1>
                                <DealStatusBadge status={deal.status} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                                <span className="flex items-center gap-2 text-indigo-200/70">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Created {fmtDateTime(deal.createdAt)}
                                </span>
                                <span className="flex items-center gap-2 text-emerald-400/80">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Escrow Protected
                                </span>
                            </div>

                            {/* Key Numbers Row */}
                            <div className="flex flex-wrap gap-6 pt-4">
                                <div>
                                    <p className="text-[10px] text-indigo-300/60 uppercase font-black tracking-[.2em]">Agreed Amount</p>
                                    <p className="text-3xl font-black text-white">{fmt(deal.agreedAmount)}</p>
                                </div>
                                {auction?.basePrice && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[.2em]">Base Price</p>
                                        <p className="text-2xl font-bold text-slate-300/70">{fmt(auction.basePrice)}</p>
                                    </div>
                                )}
                                {auction?.highestBidPrice && (
                                    <div>
                                        <p className="text-[10px] text-amber-400/70 uppercase font-black tracking-[.2em]">Highest Bid</p>
                                        <p className="text-2xl font-bold text-amber-300">{fmt(auction.highestBidPrice)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timer / Escrow CTA */}
                        <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto lg:min-w-[280px]">
                            {(deal.status === "PAYMENT_PENDING" || deal.status === "CREATED") && (
                                <div className={`px-5 py-4 rounded-2xl border backdrop-blur-sm flex items-center gap-4 ${isExpired ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                                    <div className={`p-3 rounded-xl ${isExpired ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"}`}>
                                        {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isExpired ? "text-rose-400" : "text-amber-400"}`}>
                                            {isExpired ? "Payment Overdue" : "Payment Window"}
                                        </p>
                                        <p className="text-xl font-mono font-bold text-white tracking-wider">{timeLeft || "..."}</p>
                                    </div>
                                </div>
                            )}
                            {deal.status === "IN_ESCROW" && (
                                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-300 font-bold text-sm">Funds Secured in Escrow</span>
                                </div>
                            )}
                            {isBuyer && (deal.status === "PAYMENT_PENDING" || deal.status === "CREATED") && !isExpired && (
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20"
                                >
                                    <Link to={`/payment/${deal._id}`}>
                                        <CreditCard className="w-4 h-4 mr-2" /> Initiate Payment
                                    </Link>
                                </Button>
                            )}
                            {isBuyer && deal.status === "IN_ESCROW" && (
                                <Button
                                    onClick={() => dispatch(buyerConfirmDeliveryRequest({ dealId: deal._id as string }))}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Delivery
                                </Button>
                            )}
                            {(!isBuyer) && deal.status === "IN_ESCROW" && (
                                <Button
                                    onClick={() => dispatch(refundEscrowRequest(deal._id as string))}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xl shadow-rose-500/20"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" /> Refund Escrow (Seller/Admin)
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Lifecycle Tracker ─── */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                        Transaction Progress
                    </h3>
                    <LifecycleTracker currentStatus={deal.status} />

                    {(deal.status === "COMPLETED" || deal.status === "CANCELLED") && (
                        <div className="mt-12 pt-12 border-t border-slate-100">
                             <div className="max-w-md mx-auto">
                                <RatingSubmissionCard 
                                    deal={deal} 
                                    isSubmitted={isRatingSubmitted}
                                    onSubmit={handleRatingSubmit}
                                />
                             </div>
                        </div>
                    )}
                </div>

                {/* ─── Main 3-Column Grid ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ═══ Left: 5 cols — Deal & Bid Info ═══ */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Diamond Asset Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="h-48 bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center relative">
                                {diamondImage ? (
                                    <img src={diamondImage} alt="Diamond" className="h-full w-full object-contain p-8 mix-blend-multiply" />
                                ) : (
                                    <Diamond className="w-16 h-16 text-slate-200" strokeWidth={1} />
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                    {inventory
                                        ? `${inventory?.carat?.toFixed(2)} ct ${inventory?.shape?.toLowerCase()} Diamond`
                                        : "Diamond Asset"}
                                </h3>

                                {inventory && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Color", value: inventory.color },
                                            { label: "Clarity", value: inventory.clarity },
                                            { label: "Cut", value: inventory.cut || "—" },
                                            { label: "Lab", value: inventory.lab || "—" },
                                            { label: "Location", value: inventory.location || "—" },
                                            { label: "Barcode", value: inventory.barcode || "—" },
                                        ].map((s) => (
                                            <div key={s.label} className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                                <p className="text-sm font-bold text-gray-800 mt-0.5">{s.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!inventory && (
                                    <p className="text-sm text-gray-400">Inventory details are not populated for this deal.</p>
                                )}
                            </div>
                        </div>

                        {/* Bid Details Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                                    <Gavel className="w-4 h-4" />
                                </div>
                                Bid Information
                            </h3>

                            <div className="space-y-3">
                                <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Bid ID" value={bid?._id?.slice(-10)?.toUpperCase() || "—"} mono />
                                <InfoRow icon={<Banknote className="w-3.5 h-3.5" />} label="Bid Amount" value={bid?.bidAmount ? fmt(bid.bidAmount) : "—"} highlight />
                                <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Bid Status" value={bid?.status || "—"} badge badgeColor={bid?.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"} />
                                <InfoRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Highest Bid?" value={bid?.isHighestBid ? "Yes" : "No"} badge badgeColor={bid?.isHighestBid ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"} />
                                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Placed On" value={fmtDate(bid?.createdAt)} />
                            </div>
                        </div>

                        {/* Auction Details Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                                    <Package className="w-4 h-4" />
                                </div>
                                Auction Details
                            </h3>

                            <div className="space-y-3">
                                <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Auction ID" value={auction?._id?.slice(-10)?.toUpperCase() || "—"} mono />
                                <InfoRow icon={<CircleDollarSign className="w-3.5 h-3.5" />} label="Base Price" value={auction?.basePrice ? fmt(auction.basePrice) : "—"} />
                                <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Highest Bid Price" value={auction?.highestBidPrice ? fmt(auction.highestBidPrice) : "—"} highlight />
                                <InfoRow
                                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                    label="Auction Status"
                                    value={auction?.status || "—"}
                                    badge
                                    badgeColor={auction?.status === "CLOSED" ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"}
                                />
                                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Start Date" value={fmtDate(auction?.startDate)} />
                                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="End Date" value={fmtDate(auction?.endDate)} />
                                <InfoRow icon={<Gavel className="w-3.5 h-3.5" />} label="Total Bids" value={String(auction?.bidIds?.length || 0)} />
                            </div>
                        </div>
                    </div>

                    {/* ═══ Center: 4 cols — Logistics ═══ */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Payment & Shipping */}
                        <LogisticsPanel payment={deal.payment} shipping={deal.shipping} />

                        {/* Deal Financial Summary Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200/40">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-5 flex items-center gap-2">
                                    <CircleDollarSign className="w-4 h-4" /> Financial Summary
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-200 text-sm">Agreed Amount</span>
                                        <span className="font-black text-xl">{fmt(deal.agreedAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-200 text-sm">Currency</span>
                                        <span className="font-bold">{deal.currency || "USD"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-indigo-200 text-sm">Payment Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${deal.payment?.isPaid ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                                            {deal.payment?.isPaid ? "Paid" : "Unpaid"}
                                        </span>
                                    </div>
                                    {deal.payment?.method && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-indigo-200 text-sm">Method</span>
                                            <span className="font-bold">{deal.payment.method}</span>
                                        </div>
                                    )}
                                    {deal.payment?.transactionId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-indigo-200 text-sm">Transaction ID</span>
                                            <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded-lg">{deal.payment.transactionId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-indigo-200 text-sm">Deal Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${statusColors[deal.status] || "bg-gray-500"}`}>
                                        {deal.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* History Timeline */}
                        {deal.history && deal.history.length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    Status History
                                </h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 to-transparent" />
                                    {deal.history.map((h: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 relative pb-4 last:pb-0">
                                            <div className={`w-[10px] h-[10px] rounded-full mt-1.5 shrink-0 ring-4 ring-white z-10 ${statusColors[h.status] || "bg-gray-400"}`} />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{h.status}</p>
                                                <p className="text-xs text-gray-400">
                                                    {h.changedAt ? fmtDateTime(h.changedAt) : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══ Right: 3 cols — Participants, Docs, Support ═══ */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Buyer Card */}
                        <PersonCard role="Buyer" name={buyer?.username} email={buyer?.email} color="blue" />

                        {/* Seller Card */}
                        <PersonCard role="Seller" name={seller?.username} email={seller?.email} color="purple" />

                        {/* Escrow Contracts */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-violet-500" />
                                Documents
                            </h3>
                            <PDFAccessPanel />
                        </div>

                        {/* Timestamps */}
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Timestamps</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Created</span>
                                    <span className="font-medium text-gray-700">{fmtDateTime(deal.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Updated</span>
                                    <span className="font-medium text-gray-700">{fmtDateTime(deal.updatedAt)}</span>
                                </div>
                                {deal.payment?.paidAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Paid At</span>
                                        <span className="font-medium text-gray-700">{fmtDateTime(deal.payment.paidAt as any)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Support CTA */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent" />
                            <div className="relative z-10">
                                <Diamond className="w-7 h-7 text-indigo-400 mx-auto mb-3" />
                                <p className="text-white font-bold text-sm mb-1">Need Help?</p>
                                <p className="text-slate-400 text-xs mb-4">Our escrow team is available 24/7.</p>
                                <Button className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold rounded-xl text-sm">
                                    Support <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Reusable sub-components (kept in file for locality)
   ────────────────────────────────────────────── */

function InfoRow({ icon, label, value, mono, highlight, badge, badgeColor }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
    highlight?: boolean;
    badge?: boolean;
    badgeColor?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="flex items-center gap-2 text-gray-400 text-sm">
                {icon} {label}
            </span>
            {badge ? (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor || "bg-gray-100 text-gray-600"}`}>
                    {value}
                </span>
            ) : (
                <span className={`text-sm font-semibold ${highlight ? "text-indigo-600" : "text-gray-800"} ${mono ? "font-mono text-xs bg-gray-50 px-2 py-0.5 rounded-md" : ""}`}>
                    {value}
                </span>
            )}
        </div>
    );
}

function PersonCard({ role, name, email, color }: { role: string; name?: string; email?: string; color: "blue" | "purple" }) {
    const colors = {
        blue: { bg: "bg-blue-50", ring: "ring-blue-100", icon: "bg-blue-100 text-blue-600", label: "text-blue-600" },
        purple: { bg: "bg-purple-50", ring: "ring-purple-100", icon: "bg-purple-100 text-purple-600", label: "text-purple-600" },
    };
    const c = colors[color];

    return (
        <div className={`${c.bg} p-5 rounded-3xl ring-1 ${c.ring}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${c.label}`}>{role}</p>
                    <p className="text-base font-extrabold text-gray-900">{name || "Unknown"}</p>
                </div>
            </div>
            {email && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-3 py-2 rounded-xl">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{email}</span>
                </div>
            )}
        </div>
    );
}
