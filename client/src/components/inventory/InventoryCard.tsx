import { Link } from "react-router-dom";
import { MapPin, QrCode, ArrowRight, ShieldCheck, Gem, ExternalLink, PencilIcon, Gavel } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import type { Auction } from "@/types/auction";

const STATUS_THEME: Record<string, { label: string; class: string }> = {
  AVAILABLE: { label: "Available", class: "bg-emerald-500 text-white" },
  LISTED: { label: "Listed", class: "bg-blue-500 text-white" },
  ON_MEMO: { label: "On Memo", class: "bg-amber-500 text-white" },
  LOCKED: { label: "Locked", class: "bg-slate-700 text-white" },
  SOLD: { label: "Sold", class: "bg-rose-500 text-white" },
};

export const InventoryCard = ({
  item,
  onAuction,
  activeAuction,
  hasActiveAuction
}: {
  item: InventoryItem,
  onAuction?: (item: InventoryItem) => void,
  activeAuction?: Auction,
  hasActiveAuction?: boolean
}) => {
  const status = STATUS_THEME[item.status] || STATUS_THEME.AVAILABLE;
  const isLocked = item.status === "LOCKED" || item.status === "ON_MEMO";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency || "USD",
    maximumFractionDigits: 0,
  }).format(item.price);

  return (
    <div className="group relative w-full  rounded-[32px] p-px bg-gradient-to-b from-blue-600 to-pink-500 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
      {/* --- Main Card Container with Light Gradient --- */}
      <div className="relative h-full w-full rounded-[31px] bg-gradient-to-br from-white via-white to-blue-50/50 overflow-hidden">

        {/* --- Image Section --- */}
        <div className="relative h-60 overflow-hidden m-3 rounded-[24px] bg-slate-100">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <Gem size={40} strokeWidth={1} className="mb-2 opacity-30" />
            </div>
          )}

          {/* Status Badge (Top Left) */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg ${status.class}`}>
            {status.label}
          </div>

          {/* Price Overlay (Bottom Left) */}
          <div className="absolute bottom-3 left-3 px-4 py-2 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Market Price</span>
            <span className="text-white font-bold text-lg">{formattedPrice}</span>
          </div>
        </div>

        {/* --- Content Body --- */}
        <div className="px-6 pb-6 pt-2">

          {/* Header & Lab Info */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {item.carat.toFixed(2)}ct {item.shape.toLowerCase()}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-tighter border border-indigo-100">
                  {item.lab} CERTIFIED
                </span>
              </div>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
              <ExternalLink size={18} />
            </div>
          </div>

          {/* Spec Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Color", val: item.color },
              { label: "Clarity", val: item.clarity },
              { label: "Cut", val: item.cut || "N/A" },
              { label: "Location", val: item.location, icon: <MapPin size={10} /> }
            ].map((spec, i) => (
              <div key={i} className="flex flex-col p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  {spec.icon} {spec.label}
                </span>
                <span className="text-sm font-bold text-slate-700 mt-0.5">{spec.val}</span>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="space-y-3">
            {!isLocked && (
              <Link
                to={`/inventory/edit/${item._id}`}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl font-bold text-sm transition-all duration-300 bg-white border border-indigo-100 text-indigo-600 shadow-sm hover:bg-indigo-50 active:scale-[0.98]"
              >
                <PencilIcon size={16} />
                Edit Details
              </Link>
            )}

            {activeAuction && (
              <div className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl font-bold text-sm bg-amber-50 border border-amber-200 text-amber-600 shadow-sm cursor-default">
                <Gavel size={16} />
                This item is already auctioned
              </div>
            )}

            {!activeAuction && !isLocked && item.status === "AVAILABLE" && onAuction && (
              <button
                onClick={() => onAuction(item)}
                disabled={hasActiveAuction}
                className={`w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-2xl font-bold text-sm transition-all duration-300 border shadow-sm ${hasActiveAuction
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                  : "bg-white border-amber-200 text-amber-600 hover:bg-amber-50 active:scale-[0.98]"
                  }`}
                title={hasActiveAuction ? "You already have an active auction." : "Start an auction"}
              >
                Start Auction
              </button>
            )}

            <Link
              to={isLocked ? `/deals/${item.activeDealId}` : `/inventory/${item._id}`}
              className={`w-full flex items-center justify-center gap-2 ${isLocked ? 'py-4' : 'py-3'} rounded-2xl font-bold text-sm transition-all duration-300 ${isLocked
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]"
                }`}
            >
              {isLocked ? <ShieldCheck size={16} /> : null}
              {isLocked ? "View Locked Deal" : "Manage Inventory"}
              {!isLocked && <ArrowRight size={16} />}
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-slate-400 pt-1">
              <QrCode size={12} />
              <span className="text-[10px] font-mono tracking-widest">{item.barcode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};