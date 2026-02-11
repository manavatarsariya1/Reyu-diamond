import { PaymentStatus } from "@/types/payment";
import { Check, Clock, Package, ShieldCheck, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscrowTimelineProps {
    status: PaymentStatus;
}

export function EscrowTimeline({ status }: EscrowTimelineProps) {

    const steps = [
        { id: PaymentStatus.PENDING, label: "Payment Initiated", icon: Clock },
        { id: PaymentStatus.IN_ESCROW, label: "Funds Secured", icon: ShieldCheck },
        // We might want intermediate steps here depending on granularity, but for now:
        { id: "DELIVERED", label: "Delivery Verified", icon: Package }, // Abstract step not in PaymentStatus enum directly but useful visual
        { id: PaymentStatus.RELEASED, label: "Funds Released", icon: DollarSign },
    ];

    // Helper to determine step state: 'completed' | 'current' | 'upcoming'
    const getStepState = (stepId: string, index: number) => {
        // Simple logic: if status matches stepId, it's current.
        // If status "later" in flow, it's completed.
        // This is a bit tricky with non-linear enum, so we'll use an ordered array.

        const statusOrder = [
            PaymentStatus.PENDING,
            PaymentStatus.IN_ESCROW,
            "DELIVERED",
            PaymentStatus.RELEASED
        ];

        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(stepId);

        if (status === PaymentStatus.REFUNDED || status === PaymentStatus.FAILED || status === PaymentStatus.DISPUTED) {
            // Handle edge cases simply for now - maybe just show all gray or red?
            // For this visual timeline, let's assume happy path or "frozen" path.
            if (stepIndex <= currentIndex) return 'completed'; // or error state
            return 'upcoming';
        }

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto px-4">

                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-100 -z-10 transform -translate-y-1/2" />

                {/* Connecting Line - Progress (Simplified for now, fixed width based on status not implemented perfectly visually without more complex width calc, 
                    but we can use individual lines between dots if we map them) */}

                {steps.map((step, index) => {
                    const state = getStepState(step.id, index);

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 relative bg-white px-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                                state === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" :
                                    state === 'current' ? "bg-white border-amber-400 text-amber-500 shadow-lg shadow-amber-100 scale-110" :
                                        "bg-white border-gray-200 text-gray-300"
                            )}>
                                {state === 'completed' ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>

                            <span className={cn(
                                "text-xs font-semibold tracking-wide uppercase transition-colors duration-300 absolute -bottom-8 w-32 text-center",
                                state === 'completed' ? "text-emerald-600" :
                                    state === 'current' ? "text-amber-600" :
                                        "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Spacer for labels */}
            <div className="h-8"></div>
        </div>
    );
}
