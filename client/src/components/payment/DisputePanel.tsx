import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { DisputeStatus } from "@/types/payment";

interface DisputePanelProps {
    dealId: string;
    currentStatus: DisputeStatus;
    onRaiseDispute: (reason: string) => void;
}

export function DisputePanel({ dealId, currentStatus, onRaiseDispute }: DisputePanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reason, setReason] = useState("");

    if (currentStatus !== DisputeStatus.NONE) {
        return (
            <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-full shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900">Dispute Status: {currentStatus}</h3>
                        <p className="text-sm text-orange-800/80 mt-1">
                            A dispute has been raised for this transaction. Funds in escrow are frozen until the issue is resolved by our administration team.
                            <br />
                            <span className="font-medium mt-2 block">Case Reference: DSP-{dealId.slice(0, 6)}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isExpanded) {
        return (
            <div className="mt-8 text-center">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                    Report an issue with this transaction
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                Raise a Dispute
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-xs text-gray-600 flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-blue-500" />
                <p>
                    Raising a dispute will immediately freeze escrow funds. Please only use this for serious issues such as non-delivery or item mismatch. False disputes may result in account penalties.
                </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for dispute</label>
            <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue clearly..."
                className="mb-4"
            />

            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsExpanded(false)}>Cancel</Button>
                <Button
                    variant="destructive"
                    onClick={() => {
                        if (!reason.trim()) {
                            toast.error("Please provide a reason.");
                            return;
                        }
                        onRaiseDispute(reason);
                    }}
                >
                    Submit Dispute
                </Button>
            </div>
        </div>
    );
}
