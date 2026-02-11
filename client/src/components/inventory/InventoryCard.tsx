import type { InventoryItem } from "@/types/inventory";
import { InventoryStatus } from "@/types/inventory";
import { Badge } from "@/components/ui/badge"; // Assuming Badge exists
import { Button } from "@/components/ui/button"; // Assuming Button exists
import { Diamond, QrCode, Lock, Edit2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryCardProps {
    item: InventoryItem;
}

export function InventoryCard({ item }: InventoryCardProps) {
    const getStatusBadge = (status: InventoryStatus) => {
        switch (status) {
            case InventoryStatus.AVAILABLE:
                return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100">Available</Badge>;
            case InventoryStatus.LISTED:
                return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">Listed</Badge>;
            case InventoryStatus.LOCKED:
                return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</Badge>;
            case InventoryStatus.COMPLETED:
                return <Badge variant="secondary">Sold</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            <div className="p-4 flex gap-4 items-start">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-gray-300 flex-shrink-0">
                    {item.thumbnail ? (
                        <img src={item.thumbnail} alt="Diamond" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <Diamond className="w-8 h-8 opacity-40" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                                {item.carat}ct {item.shape} {item.color} {item.clarity}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {item.sku || item.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        {getStatusBadge(item.status)}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded text-xs font-medium border border-gray-100">
                            {item.certification}
                        </div>
                        {item.barcode && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500" title={`Barcode: ${item.barcode}`}>
                                <QrCode className="w-3.5 h-3.5" />
                                <span className="font-mono">{item.barcode}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-auto border-t border-gray-50 p-2 flex items-center justify-between bg-gray-50/30">
                <span className="text-[10px] text-gray-400 px-2">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                    {item.status === InventoryStatus.LOCKED ? (
                        <Button variant="ghost" size="sm" className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" asChild>
                            <Link to={`/deals/${item.activeDealId}`}>
                                View Deal <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50" asChild>
                            <Link to={`/inventory/${item.id}`}>
                                Manage
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
