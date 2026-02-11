import { useState } from "react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import type { InventoryItem } from "@/types/inventory";
import { InventoryStatus } from "@/types/inventory";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification } from "@/types/preference";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { BarcodeScannerModal } from "@/components/inventory/BarcodeScannerModal";

// Mock Data
const MOCK_INVENTORY: InventoryItem[] = [
    {
        id: "inv-1",
        sellerId: "seller-1",
        shape: DiamondShape.ROUND,
        carat: 1.02,
        color: DiamondColor.D,
        clarity: DiamondClarity.VVS1,
        certification: DiamondCertification.GIA,
        status: InventoryStatus.AVAILABLE,
        barcode: "DIA-001021",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "inv-2",
        sellerId: "seller-1",
        shape: DiamondShape.OVAL,
        carat: 2.15,
        color: DiamondColor.G,
        clarity: DiamondClarity.VS2,
        certification: DiamondCertification.IGI,
        status: InventoryStatus.LISTED,
        listingId: "lst-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "inv-3",
        sellerId: "seller-1",
        shape: DiamondShape.PRINCESS,
        carat: 0.90,
        color: DiamondColor.E,
        clarity: DiamondClarity.SI1,
        certification: DiamondCertification.GIA,
        status: InventoryStatus.LOCKED,
        activeDealId: "deal-456",
        sku: "PR-90-E",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [scannerOpen, setScannerOpen] = useState(false);

    const handleSearch = (query: string) => {
        // Simple client-side search mock
        if (!query) {
            setItems(MOCK_INVENTORY);
            return;
        }
        const lower = query.toLowerCase();
        setItems(MOCK_INVENTORY.filter(i =>
            i.id.includes(lower) ||
            i.barcode?.toLowerCase().includes(lower) ||
            i.sku?.toLowerCase().includes(lower) ||
            i.shape.toLowerCase().includes(lower)
        ));
    };

    const handleQuickScan = (code: string) => {
        // Mock finding item by scan
        const found = MOCK_INVENTORY.find(i => i.barcode === code);
        if (found) {
            setItems([found]); // Filter to just that item
        } else {
            // maybe show "Not found" or open add form
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage your diamond stock and listings</p>
                </div>
                <Button variant="outline" className="bg-white" onClick={() => setScannerOpen(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Barcode
                </Button>
            </div>

            <InventoryStats
                total={MOCK_INVENTORY.length}
                available={MOCK_INVENTORY.filter(i => i.status === InventoryStatus.AVAILABLE).length}
                listed={MOCK_INVENTORY.filter(i => i.status === InventoryStatus.LISTED).length}
                locked={MOCK_INVENTORY.filter(i => i.status === InventoryStatus.LOCKED).length}
            />

            <InventoryFilters onSearch={handleSearch} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <InventoryCard key={item.id} item={item} />
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 mt-6">
                    <p className="text-gray-400 mb-2">No inventory items found</p>
                    <Button variant="link">Clear Filters</Button>
                </div>
            )}

            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleQuickScan}
            />
        </div>
    );
}
