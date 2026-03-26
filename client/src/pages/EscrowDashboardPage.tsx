import { useParams } from "react-router-dom";
import { SecurePaymentHeader } from "@/components/payment/SecurePaymentHeader";
import { EscrowTimeline } from "@/components/payment/EscrowTimeline";
import { DisputePanel } from "@/components/payment/DisputePanel";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PaymentStatus, DisputeStatus } from "@/types/payment";
import { useState, useEffect } from "react";
import { Shield, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchDealByIdRequest } from "@/features/deal/dealSlice";

export default function EscrowDashboardPage() {
    const { dealId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { currentDeal: deal, isLoading } = useSelector((state: RootState) => state.deal);
    const [disputeStatus, setDisputeStatus] = useState(DisputeStatus.NONE);

    useEffect(() => {
        if (dealId) {
            dispatch(fetchDealByIdRequest(dealId));
        }
    }, [dispatch, dealId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-slate-500">
                Deal not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SecurePaymentHeader />

            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Status</h1>
                    <p className="text-gray-500 text-sm mt-1">Reference: {dealId}</p>
                </div>

                {/* Main Status Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Secure Escrow Account</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500">Current Status:</span>
                                    {/* Using deal.status directly if it matches PaymentStatus enum approximately */}
                                    <PaymentStatusBadge status={deal.status as any} disputeStatus={disputeStatus} />
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-400 uppercase tracking-wider">Funds Held</p>
                            <p className="text-2xl font-bold text-gray-900">${deal.agreedAmount?.toLocaleString()}</p>
                        </div>
                    </div>

                    <EscrowTimeline status={deal.status as any} />

                    <div className="p-6 bg-slate-50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            Transaction Date: <span className="font-medium text-gray-900">{new Date(deal.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 md:justify-end">
                            <a href="#" className="flex items-center gap-1 hover:underline hover:text-blue-600">
                                View official receipt <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Logistics or Next Steps info could go here */}

                {/* Dispute Section */}
                <DisputePanel
                    dealId={dealId || ""}
                    currentStatus={disputeStatus}
                    onRaiseDispute={(reason) => {
                        console.log("Dispute raised:", reason);
                        setDisputeStatus(DisputeStatus.OPEN);
                    }}
                />
            </div>
        </div>
    );
}
