import type { Deal } from "@/types/deal";
import { DealStatusBadge } from "./DealStatusBadge";
import { Diamond, ArrowRight, Banknote, Calendar, ShieldCheck, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface DealCardProps {
    deal: Deal;
}

const statusAccent: Record<string, string> = {
    CREATED: "from-blue-500/10    border-l-blue-400",
    PAYMENT_PENDING: "from-amber-500/10   border-l-amber-400",
    IN_ESCROW: "from-purple-500/10  border-l-purple-400",
    SHIPPED: "from-cyan-500/10    border-l-cyan-400",
    DELIVERED: "from-teal-500/10    border-l-teal-400",
    COMPLETED: "from-emerald-500/10 border-l-emerald-400",
    DISPUTED: "from-red-500/10     border-l-red-400",
    CANCELLED: "from-gray-500/5     border-l-gray-300",
};



export function DealCard({ deal }: DealCardProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: deal.currency || "USD", maximumFractionDigits: 0 }).format(n);

    const auction = deal.auctionId as any;
    const inventory = typeof auction?.inventoryId === "object" ? auction.inventoryId : null;
    const bid = deal.bidId as any;
    const buyer = deal.buyerId as any;
    const seller = deal.sellerId as any;

    const diamondImage = inventory?.images?.[0];
    const title = inventory
        ? `${inventory?.carat?.toFixed?.(2) ?? inventory.carat} ct ${inventory.shape}`
        : `Deal #${deal._id.slice(-8).toUpperCase()}`;

    const accentClass = statusAccent[deal.status] ?? statusAccent.CREATED;

    const fmtDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";


    return (
        <Link
            to={`/deals/${deal._id}`}
            className={`group block bg-white rounded-2xl border border-gray-100 border-l-4 ${accentClass} bg-gradient-to-r to-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
        >
            <div className="flex items-stretch gap-0">

                {/* ── Thumbnail ── */}
                <div className="w-24 h-40 sm:w-32 shrink-0 bg-slate-50 flex items-center justify-center border-r border-gray-100 relative overflow-hidden">
                    {diamondImage ? (
                        <img
                            src={diamondImage}
                            alt="Diamond"
                            className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <Diamond className="w-10 h-10 text-slate-200 group-hover:text-indigo-200 transition-colors" strokeWidth={1} />
                    )}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 px-5 py-4 min-w-0">
                    {/* Top row: title + status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                {inventory?.lab ? `${inventory.lab} Certified` : "Diamond Asset"}
                            </p>
                            <h4 className="text-base font-extrabold text-gray-900 truncate leading-tight">
                                {title}
                                {inventory?.clarity && inventory?.color && (
                                    <span className="ml-2 text-sm font-semibold text-gray-400">
                                        {inventory.color} / {inventory.clarity}
                                    </span>
                                )}
                            </h4>
                        </div>
                        <div className="shrink-0">
                            <DealStatusBadge status={deal.status} />
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Amount */}
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <Banknote className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Amount</p>
                                <p className="text-sm font-black text-gray-900 leading-tight">{fmt(deal.agreedAmount)}</p>
                            </div>
                        </div>


                        {/* Participants */}
                        <div className="flex items-center gap-2 hidden sm:flex">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Buyer</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                                    {buyer?.username || deal._id.slice(-6)}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 hidden sm:flex">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Created</p>
                                <p className="text-sm font-bold text-gray-700 leading-tight">{fmtDate(deal.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: ID + seller + arrow */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded-md">
                                #{deal._id.slice(-10).toUpperCase()}
                            </span>
                            {seller?.username && (
                                <span>
                                    Seller: <span className="text-gray-600 font-semibold">{seller.username}</span>
                                </span>
                            )}
                            {bid?.bidAmount && bid.bidAmount !== deal.agreedAmount && (
                                <span className="hidden sm:inline">
                                    Bid: <span className="text-indigo-500 font-semibold">{fmt(bid.bidAmount)}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 group-hover:text-indigo-700 transition-colors">
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
