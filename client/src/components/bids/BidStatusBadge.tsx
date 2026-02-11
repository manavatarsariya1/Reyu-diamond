import { BidStatus } from "@/types/bid";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Ban, ArrowUpCircle } from "lucide-react";

interface BidStatusBadgeProps {
    status: BidStatus;
    className?: string;
}

export function BidStatusBadge({ status, className }: BidStatusBadgeProps) {
    const config = {
        [BidStatus.PENDING]: {
            label: "Pending",
            icon: Clock,
            style: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
        [BidStatus.ACCEPTED]: {
            label: "Accepted",
            icon: CheckCircle2,
            style: "bg-green-100 text-green-800 border-green-200",
        },
        [BidStatus.REJECTED]: {
            label: "Rejected",
            icon: XCircle,
            style: "bg-red-100 text-red-800 border-red-200",
        },
        [BidStatus.CANCELLED]: {
            label: "Cancelled",
            icon: Ban,
            style: "bg-gray-100 text-gray-800 border-gray-200",
        },
        [BidStatus.OUTBID]: {
            label: "Outbid",
            icon: ArrowUpCircle,
            style: "bg-orange-100 text-orange-800 border-orange-200",
        },
    };

    const { label, icon: Icon, style } = config[status];

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm",
            style,
            className
        )}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}
