import { DealStatus } from "@/types/deal";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface LifecycleTrackerProps {
    currentStatus: DealStatus;
}

export function LifecycleTracker({ currentStatus }: LifecycleTrackerProps) {
    const steps = [
        { status: DealStatus.CREATED, label: "Created" },
        { status: DealStatus.PAYMENT_PENDING, label: "Payment" },
        { status: DealStatus.IN_ESCROW, label: "Escrow" },
        { status: DealStatus.SHIPPED, label: "Shipped" },
        { status: DealStatus.DELIVERED, label: "Delivered" },
        { status: DealStatus.COMPLETED, label: "Complete" },
    ];

    // Find current index
    const currentIndex = steps.findIndex(s => s.status === currentStatus);
    const isCancelled = currentStatus === DealStatus.CANCELLED;
    const isDisputed = currentStatus === DealStatus.DISPUTED;

    if (isCancelled || isDisputed) {
        return (
            <div className={cn(
                "p-4 rounded-lg border text-center font-medium",
                isCancelled ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-red-50 border-red-200 text-red-700"
            )}>
                Deal is {isCancelled ? "Cancelled" : "Disputed"}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-1 bg-gray-100 rounded-full" />

            {/* Active Progress Bar */}
            <div
                className="absolute top-4 left-0 h-1 bg-indigo-600 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.status} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white",
                                isCompleted
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-gray-200 text-gray-300",
                                isCurrent && "ring-4 ring-indigo-100"
                            )}>
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-xs">{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-300 absolute top-10 w-20 text-center",
                                isCompleted ? "text-indigo-900" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Spacer for labels */}
            <div className="h-6" />
        </div>
    );
}
