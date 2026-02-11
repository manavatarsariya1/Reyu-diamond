import { Package, CheckCircle, Tag, Lock } from "lucide-react";

interface InventoryStatsProps {
    total: number;
    available: number;
    listed: number;
    locked: number;
}

export function InventoryStats({ total, available, listed, locked }: InventoryStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-gray-600">
                    <Package className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Inventory</p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{available}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                    <Tag className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Listed</p>
                    <p className="text-2xl font-bold text-gray-900">{listed}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Locked</p>
                    <p className="text-2xl font-bold text-gray-900">{locked}</p>
                </div>
            </div>
        </div>
    );
}
