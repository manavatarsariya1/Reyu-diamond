import { PaymentStatus, DisputeStatus } from "@/types/payment";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
    disputeStatus?: DisputeStatus;
    className?: string;
}

export function PaymentStatusBadge({ status, disputeStatus, className }: PaymentStatusBadgeProps) {
    if (disputeStatus && disputeStatus !== DisputeStatus.NONE && disputeStatus !== DisputeStatus.RESOLVED && disputeStatus !== DisputeStatus.REJECTED) {
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200", className)}>
                Dispute: {disputeStatus}
            </span>
        );
    }

    const styles = {
        [PaymentStatus.PENDING]: "bg-gray-100 text-gray-600 border-gray-200",
        [PaymentStatus.IN_ESCROW]: "bg-blue-50 text-blue-700 border-blue-200", // Escrow is typically secure/trust color
        [PaymentStatus.RELEASED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
        [PaymentStatus.REFUNDED]: "bg-purple-50 text-purple-700 border-purple-200",
        [PaymentStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
        [PaymentStatus.DISPUTED]: "bg-orange-50 text-orange-700 border-orange-200",
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status], className)}>
            {status}
        </span>
    );
}
