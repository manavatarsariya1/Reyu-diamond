import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import type { InventoryItem } from "@/types/inventory";
import { InventoryStatus } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { BarcodeScannerModal } from "@/components/inventory/BarcodeScannerModal";
import { AuctionForm } from "@/components/inventory/AuctionForm";
import { useLayout } from "@/utils/Layoutcontext";

// Redux
import { fetchInventoriesStart } from "@/features/inventory/inventorySlice";
import { fetchAuctionsStart } from "@/features/auction/auctionSlice";
import type { RootState } from "@/app/store";

export default function InventoryPage() {
    const dispatch = useDispatch();
    const { items: inventoryItems, loading } = useSelector((state: RootState) => state.inventory);
    const auctions = useSelector((state: RootState) => state.auction.items);
    const user = useSelector((state: RootState) => state.auth.user);
    const currentUserId = user?._id || user?.id;
    const currentUserRole = user?.role;
    const { isCollapsed } = useLayout();

    // Only ONE piece of state needed — the search string
    const [searchQuery, setSearchQuery] = useState("");
    const [scannerOpen, setScannerOpen] = useState(false);

    // Auction Modal State
    const [auctionModalOpen, setAuctionModalOpen] = useState(false);
    const [selectedAuctionItem, setSelectedAuctionItem] = useState<InventoryItem | null>(null);

    console.log("currentUserId:", currentUserId);
    console.log("sellerId:", inventoryItems[0]?.sellerId);
    console.log("match:", currentUserId === inventoryItems[0]?.sellerId);

    useEffect(() => {
        dispatch(fetchInventoriesStart());
        dispatch(fetchAuctionsStart());
    }, [dispatch]);

    // ── Global Auction constraints ───────────────────────
    const userActiveAuction = useMemo(() => {
        if (!currentUserId) return null;
        return auctions.find(a => a.recipient === currentUserId && a.status === "ACTIVE");
    }, [auctions, currentUserId]);

    // ── Step 1: seller filter (derived, no state) ────────────────────────────
    const myItems = useMemo(
        () => {
            if (currentUserRole === "admin") return inventoryItems;
            return currentUserId
                ? inventoryItems.filter(i => i.sellerId === currentUserId)
                : [];
        },
        [inventoryItems, currentUserId, currentUserRole]
    );

    // ── Step 2: search filter (derived, no state) ────────────────────────────
    const filteredItems = useMemo(() => {
        if (!searchQuery) return myItems;
        const lower = searchQuery.toLowerCase();
        return myItems.filter(i =>
            i._id.toLowerCase().includes(lower) ||
            i.barcode?.toLowerCase().includes(lower) ||
            i.shape.toLowerCase().includes(lower) ||
            i.title?.toLowerCase().includes(lower)
        );
    }, [myItems, searchQuery]);

    // console.log(filteredItems,"mmm")


    const handleSearch = (query: string) => setSearchQuery(query);

    const handleQuickScan = (code: string) => setSearchQuery(code);

    const handleOpenAuction = (item: InventoryItem) => {
        setSelectedAuctionItem(item);
        setAuctionModalOpen(true);
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
                total={myItems.length}
                available={myItems.filter(i => i.status === InventoryStatus.AVAILABLE).length}
                listed={myItems.filter(i => i.status === InventoryStatus.LISTED).length}
                locked={myItems.filter(i => i.locked).length}
            />

            <InventoryFilters onSearch={handleSearch} />

            {loading ? (
                <div className="flex justify-center items-center py-20 mt-6">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className={
                    isCollapsed
                        ? "grid grid-cols-4 gap-4"
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                }>
                    {filteredItems.map(item => (
                        console.log(item),
                        <InventoryCard
                            key={item._id}
                            item={item}
                            onAuction={handleOpenAuction}
                            activeAuction={auctions.find(a => a.inventoryId === item._id && a.status === "ACTIVE")}
                            hasActiveAuction={!!userActiveAuction}
                        />
                    ))}
                </div>
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 mt-6">
                    <p className="text-gray-400 mb-2">No inventory items found</p>
                    <Button variant="link" onClick={() => setSearchQuery("")}>
                        Clear Filters
                    </Button>
                </div>
            )}

            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={handleQuickScan}
            />

            <AuctionForm
                isOpen={auctionModalOpen}
                onOpenChange={setAuctionModalOpen}
                inventoryItem={selectedAuctionItem}
            />
        </div>
    );
}