import { BadgeTier } from "@/types/rating";
import { cn } from "@/lib/utils";
import { Award, ShieldCheck, Gem } from "lucide-react";

interface ReputationBadgeProps {
    tier: BadgeTier;
    className?: string;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export function ReputationBadge({ tier, className, showLabel = true, size = "md" }: ReputationBadgeProps) {

    const getTierConfig = (tier: BadgeTier) => {
        switch (tier) {
            case BadgeTier.DIAMOND:
                return {
                    bg: "bg-blue-950",
                    text: "text-blue-50",
                    border: "border-blue-700",
                    icon: <Gem className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-blue-300 animate-pulse")} />,
                    gradient: "bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950"
                };
            case BadgeTier.PLATINUM:
                return {
                    bg: "bg-slate-900",
                    text: "text-slate-50",
                    border: "border-slate-700",
                    icon: <Gem className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-cyan-200")} />,
                    gradient: "bg-gradient-to-r from-slate-900 to-slate-800"
                };
            case BadgeTier.GOLD:
                return {
                    bg: "bg-amber-50",
                    text: "text-amber-700",
                    border: "border-amber-200",
                    icon: <Award className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-amber-500")} />,
                    gradient: "bg-gradient-to-r from-amber-50 to-amber-100"
                };
            case BadgeTier.SILVER:
                return {
                    bg: "bg-gray-100",
                    text: "text-gray-700",
                    border: "border-gray-200",
                    icon: <ShieldCheck className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-gray-400")} />,
                    gradient: "bg-gradient-to-r from-gray-50 to-gray-100"
                };
            case BadgeTier.BRONZE:
            default:
                return {
                    bg: "bg-orange-50",
                    text: "text-orange-800",
                    border: "border-orange-200",
                    icon: <Award className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5", "text-orange-600")} />,
                    gradient: "bg-gradient-to-r from-orange-50 to-orange-100"
                };
        }
    };

    const config = getTierConfig(tier);

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-all hover:shadow-md cursor-help",
                config.bg,
                config.text,
                config.border,
                className
            )}
            title={`${tier} Reputation Tier`}
        >
            {config.icon}
            {showLabel && <span className={cn(size === "sm" ? "text-[10px]" : "text-xs", "font-semibold tracking-wide uppercase")}>{tier}</span>}
        </div>
    );
}
