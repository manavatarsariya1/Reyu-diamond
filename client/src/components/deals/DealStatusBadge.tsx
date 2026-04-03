import type { DealStatus } from "@/types/deal";
import { cn } from "@/lib/utils";
import {
    Clock,
    CreditCard,
    ShieldCheck,
    Truck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    PackageCheck
} from "lucide-react";

interface DealStatusBadgeProps {
    status: DealStatus;
    className?: string;
}

export function DealStatusBadge({ status, className }: DealStatusBadgeProps) {
    const config: Record<DealStatus, { label: string; icon: any; style: string }> = {
        CREATED: {
            label: "Deal Created",
            icon: Clock,
            style: "bg-blue-100 text-blue-800 border-blue-200",
        },
        PAYMENT_PENDING: {
            label: "Payment Pending",
            icon: CreditCard,
            style: "bg-amber-100 text-amber-800 border-amber-200",
        },
        IN_ESCROW: {
            label: "In Escrow",
            icon: ShieldCheck,
            style: "bg-purple-100 text-purple-800 border-purple-200",
        },
        SHIPPED: {
            label: "Shipped",
            icon: Truck,
            style: "bg-cyan-100 text-cyan-800 border-cyan-200",
        },
        DELIVERED: {
            label: "Delivered",
            icon: PackageCheck,
            style: "bg-indigo-100 text-indigo-800 border-indigo-200",
        },
        COMPLETED: {
            label: "Completed",
            icon: CheckCircle2,
            style: "bg-emerald-100 text-emerald-800 border-emerald-200",
        },
        DISPUTED: {
            label: "Disputed",
            icon: AlertTriangle,
            style: "bg-red-100 text-red-800 border-red-200",
        },
        CANCELLED: {
            label: "Cancelled",
            icon: XCircle,
            style: "bg-gray-100 text-gray-800 border-gray-200",
        },
    };

    const { label, icon: Icon, style } = config[status] || config["CREATED"];

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
