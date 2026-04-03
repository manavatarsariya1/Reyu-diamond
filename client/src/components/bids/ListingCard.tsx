import { Link, useNavigate } from "react-router-dom";
import { Lock, Gavel, QrCode, Search, Sun, Eye, Star, Package, Share2 } from "lucide-react";
import ShareInventoryButton from "../inventory/ShareInventoryButton";
import { ReputationBadge } from "../reputation/ReputationBadge";
import type { DiamondListing } from "@/types/listing";
import { ListingStatus } from "@/types/listing";


interface ListingCardProps {
  listing: DiamondListing;
  isOwner?: boolean;
  onPlaceBid?: (listing: DiamondListing) => void;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const toTitle = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ─── Placeholder gem SVG per shape ───────────────────────────────────────────
function ShapeSVG({ shape }: { shape: string }) {
  const p = { fill: "none" as const, stroke: "#a89070", strokeWidth: 0.9 };
  const s = shape.toUpperCase();
  return (
    <svg width="52" height="52" viewBox="0 0 24 24">
      {s === "ROUND" && (<>
        <circle cx="12" cy="12" r="9" {...p} />
        <path d="M12 3l2.5 5.5h-5L12 3z" {...p} />
        <path d="M3 12h18M12 3l5 9M12 3l-5 9M7 12l5 9M17 12l-5 9" {...p} />
      </>)}
      {s === "PRINCESS" && (<>
        <path d="M4 4h16v6L12 22 4 10z" {...p} />
        <path d="M4 10h16M8 4l2 6M16 4l-2 6" {...p} />
      </>)}
      {s === "OVAL" && (<>
        <ellipse cx="12" cy="12" rx="6" ry="9" {...p} />
        <path d="M12 3l2 5h-4l2-5zM6 12h12" {...p} />
      </>)}
      {s === "CUSHION" && (<>
        <rect x="4" y="4" width="16" height="16" rx="5" {...p} />
        <path d="M4 10h16M4 14h16M10 4v16M14 4v16" {...{ ...p, strokeWidth: 0.5, opacity: 0.5 }} />
      </>)}
      {s === "EMERALD" && (<>
        <path d="M5 4h14l3 6-10 11L2 10z" {...p} />
        <path d="M2 10h20M5 4l3 6M19 4l-3 6" {...p} />
      </>)}
      {!["ROUND", "PRINCESS", "OVAL", "CUSHION", "EMERALD"].includes(s) && (<>
        <path d="M6 3h12l4 6-10 13L2 9z" {...p} />
        <path d="M2 9h20M6 3l4 6M18 3l-4 6M12 22L6.5 9M12 22l5.5-13" {...p} />
      </>)}
    </svg>
  );
}

// ─── Spec cell ────────────────────────────────────────────────────────────────
function SpecCell({
  icon, label, value, last,
}: {
  icon: React.ReactNode; label: string; value: string; last?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 py-3 px-2 bg-[#faf8f4] ${!last ? "border-r border-[#ede9e0]" : ""}`}>
      <span className="text-[#c9a96e] opacity-80">{icon}</span>
      <span className="text-[8.5px] font-semibold uppercase tracking-widest text-[#b0a090]">{label}</span>
      <span className="text-[13px] font-semibold text-[#1a1612] leading-none">{value}</span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function ListingCard({ listing, onPlaceBid, isOwner }: ListingCardProps) {
  //   const isOwner  = listing.sellerId === userId;
  const isLocked = listing.status === ListingStatus.LOCKED;
  //   const isActive = listing.status === "ACTIVE";

  const navigate = useNavigate()

  return (
    <div className="
      group relative w-full max-w-[380px] rounded-[28px] overflow-hidden
      bg-[#faf8f4] cursor-pointer
      shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_4px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.09)]
      hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_2px_4px_rgba(0,0,0,0.04),0_32px_80px_rgba(0,0,0,0.16)]
      hover:-translate-y-2 transition-all duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)]
    ">

      {/* ── Image / Placeholder ──────────────────────────── */}
      <div className="relative h-[260px] overflow-hidden bg-[#ede9e0]">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={`${listing.carat}ct ${listing.shape}`}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col gap-2 bg-gradient-to-br from-[#ede9df] to-[#e4dfd4] relative overflow-hidden">
            {/* Hatched texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(0,0,0,0.015) 28px,rgba(0,0,0,0.015) 29px)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <ShapeSVG shape={listing.shape} />
              <span className="text-[11px] tracking-[.2em] uppercase text-black/25 italic">
                {toTitle(listing.shape)} Cut
              </span>
            </div>
          </div>
        )}

        {/* Bottom cert ribbon */}
        <div className="absolute bottom-0 left-0 right-0 pt-8 px-4 pb-3 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between">
          <span className="text-[13px] text-white/55 tracking-[.12em] uppercase italic">
            {listing.certification ?? "GIA"} Certified
          </span>
          <span className="bg-[#c9a96e] text-[#1a1612] text-[10px] font-bold px-2.5 py-1 rounded-[5px] uppercase tracking-[.08em]">
            {listing.cut ? toTitle(listing.cut) : "Excellent"}
          </span>
        </div>

        {/* Top-left tag */}
        {isOwner ? (
          <div className="absolute top-4 left-4 bg-[#1a1612] text-[#c9a96e] text-[10px] font-semibold uppercase tracking-[.14em] px-3 py-1.5 rounded-[8px]">
            Your Listing
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-[#faf8f4]/90 backdrop-blur border border-black/[0.07] text-[#8c7a5e] text-[10px] font-semibold uppercase tracking-[.12em] px-3 py-1.5 rounded-[8px]">
            Lot #{listing.id.slice(-4).toUpperCase()}
          </div>
        )}

        {/* Locked tag top-right */}
        {isLocked && (
          <div className="absolute top-4 right-4 bg-[#1a1612]/85 backdrop-blur text-white/70 text-[10px] font-semibold uppercase tracking-[.1em] px-3 py-1.5 rounded-[8px] flex items-center gap-1.5">
            <Lock size={10} />
            Locked
          </div>
        )}

        {/* Seller Info & Actions top-right (only if not locked and not owner) */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
          {!isLocked && !isOwner && (
            <>
              {listing.sellerRating && (
                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-1.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-gray-900">{listing.sellerRating.average.toFixed(1)}</span>
                </div>
              )}
              {listing.sellerBadges && listing.sellerBadges.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm px-1 rounded-full shadow-sm border border-white/50">
                  <ReputationBadge tier={listing.sellerBadges[0] as any} size="sm" showLabel={false} />
                </div>
              )}
            </>
          )}
          
          {/* Share Button moved here for visibility */}
          {listing.id && (
            <div className="group/share hover:scale-110 transition-all duration-300">
               <ShareInventoryButton 
                  inventoryId={listing.id} 
                  title={`${listing.carat}ct ${listing.shape}`}
                  className="!w-20 !h-10 !p-0 !rounded-full !bg-white/90 !backdrop-blur border-none shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-gray-700 hover:!bg-white hover:text-indigo-600 flex items-center justify-center"
               />
            </div>
          )}
        </div>

      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">

        {/* Header: stone name + price */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[24px] font-bold text-[#1a1612] tracking-tight leading-tight">
              {listing.carat.toFixed(2)}ct {toTitle(listing.shape)}
            </h3>
            <p className="text-[11px] font-medium uppercase tracking-[.08em] text-[#b0a090] mt-0.5">
              {listing.color} Color · {listing.clarity} Clarity
            </p>
          </div>
          <div className="text-right shrink-0 ml-3">
            <span className="block text-[9px] font-semibold uppercase tracking-[.14em] text-[#c9a96e] mb-0.5">
              {listing.totalBids > 0 ? "Current Bid" : "Starting Price"}
            </span>
            <span className="text-[20px] font-bold text-[#1a1612] leading-none">
              {fmt(listing.price)}
            </span>
          </div>
        </div>

        {/* Gold divider */}
        <div
          className="h-px mb-4"
          style={{
            background:
              "linear-gradient(to right, rgba(201,169,110,0.18) 0%, #c9a96e 35%, rgba(201,169,110,0.18) 100%)",
          }}
        />

        {/* 4-col spec grid */}
        <div className="grid grid-cols-4 border border-[#ede9e0] rounded-[14px] overflow-hidden mb-4">
          <SpecCell icon={<Sun size={12} />} label="Color" value={listing.color} />
          <SpecCell icon={<Eye size={12} />} label="Clarity" value={listing.clarity} />
          <SpecCell icon={<Star size={12} />} label="Cut" value={listing.cut?.slice(0, 2).toUpperCase() ?? "EX"} />
          <SpecCell icon={<Package size={12} />} label="Lab" value={listing.certification ?? "GIA"} last />
        </div>

        {/* Timer / status bar */}
        <div className="flex items-center gap-2 bg-[#f3efe6] rounded-[10px] px-3 py-2 mb-4">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLocked ? "bg-[#8c7a5e] opacity-50" : "bg-[#c9a96e] animate-pulse"
              }`}
          />
          <span className="text-[11.5px] text-[#8c7a5e] font-medium flex-1">
            {isLocked ? "Status" : "Auction closes in"}
          </span>
          <span className="text-[13px] font-semibold text-[#1a1612] tracking-wide">
            {isLocked ? "On Memo · Locked" : (listing.timeLeft ?? "2d · 14h · 32m")}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5 mb-3">
          <Link
            to={`/marketplace/${listing.id}`}
            className={`
              h-[50px] flex items-center justify-center gap-1.5 rounded-[14px]
              border-[1.5px] border-[#e4dfd4] text-[#6b5e4e] text-[12.5px] font-semibold
              tracking-[.04em] no-underline transition-all duration-200
              hover:bg-[#f3efe6] hover:border-[#c9a96e]/40 hover:text-[#1a1612]
              ${isOwner ? "flex-1" : "flex-1"}
            `}
          >
            <Search size={13} />
            {isOwner ? "Manage Listing" : "Details"}
          </Link>

          {!isOwner && (
            <div className="flex flex-1 gap-1.5">
              {/* <button
                onClick={() => onCreateDeal?.(listing)}
                className="
                    flex-1 h-[50px] flex items-center justify-center gap-1.5
                    bg-[#c9a96e] rounded-[14px] text-white text-[12px] font-bold
                    tracking-[.04em] border-none cursor-pointer
                    shadow-[0_4px_15px_rgba(201,169,110,0.3)]
                    hover:bg-[#b8985c] hover:shadow-[0_6px_20px_rgba(201,169,110,0.4)]
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-200
                "
              >
                <Package size={14} className="opacity-90" />
                Buy Now
              </button> */}

              <button
                onClick={() => onPlaceBid ? onPlaceBid(listing) : navigate(`/marketplace/${listing.id}`)}
                className="
                  flex-1 h-[50px] flex items-center justify-center gap-1.5
                  bg-[#1a1612] rounded-[14px] text-[#faf8f4] text-[12px] font-semibold
                  tracking-[.04em] border-none cursor-pointer
                  shadow-[0_4px_20px_rgba(26,22,18,0.25)]
                  hover:shadow-[0_6px_28px_rgba(26,22,18,0.38)]
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200
                "
              >
                <Gavel size={14} className="text-[#c9a96e]" />
                Place Bid
              </button>
            </div>
          )}
        </div>

        {/* SKU — visible on hover */}
        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <QrCode size={11} className="text-[#c4baad]" />
          <span className="text-[9.5px] font-mono text-[#c4baad] uppercase tracking-[.1em]">
            REF · {listing.barcode ?? (typeof listing.id === "string" ? listing.id.toUpperCase() : "INV")}
          </span>
        </div>

      </div>
    </div>
  );
}