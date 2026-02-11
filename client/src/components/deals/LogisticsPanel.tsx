import type { DealLogistics } from "@/types/deal.ts";
import { Truck, CreditCard, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LogisticsPanelProps {
    logistics: DealLogistics;
}

export function LogisticsPanel({ logistics }: LogisticsPanelProps) {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">Payment & Escrow</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Method</span>
                        <span className="font-medium text-gray-900">{logistics.paymentMethod || "Wire Transfer"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Escrow ID</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-gray-900">{logistics.escrowId || "Generating..."}</span>
                            {logistics.escrowId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    onClick={() => copyToClipboard(logistics.escrowId!, "Escrow ID")}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Transaction ID</span>
                        <span className="font-mono text-sm text-gray-400">{logistics.paymentTransactionId || "Pending"}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                        <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">Shipping & Delivery</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Carrier</span>
                        <span className="font-medium text-gray-900">{logistics.shippingCarrier || "Not assigned"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-500">Tracking #</span>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "font-mono text-sm",
                                logistics.trackingNumber ? "text-indigo-600 font-medium cursor-pointer hover:underline" : "text-gray-400"
                            )}>
                                {logistics.trackingNumber || "Pending"}
                            </span>
                            {logistics.trackingNumber && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                    onClick={() => copyToClipboard(logistics.trackingNumber!, "Tracking Number")}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Est. Delivery</span>
                        <span className="font-medium text-gray-900">{logistics.estimatedDeliveryDate || "TBD"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
