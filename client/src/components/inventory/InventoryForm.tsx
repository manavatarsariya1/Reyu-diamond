import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { QrCode, Save } from "lucide-react";
import {
    DiamondShape,
    DiamondColor,
    DiamondClarity,
    DiamondCertification
} from "@/types/preference";

export function InventoryForm() {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [barcode, setBarcode] = useState("");

    // Mock submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Inventory item saved successfully!");
        // Simulate redirect or reset
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Specs & Details</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Shape</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            {Object.values(DiamondShape).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Carat Weight</Label>
                        <Input type="number" step="0.01" placeholder="1.00" />
                    </div>
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            {Object.values(DiamondColor).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Clarity</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            {Object.values(DiamondClarity).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    Tracking
                </h3>

                <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                        <Label>Barcode / SKU</Label>
                        <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan or enter code..." />
                    </div>
                    <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Scan
                    </Button>
                </div>
                <p className="text-xs text-gray-500">Link a physical barcode to track this item's movement.</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button">Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Inventory
                </Button>
            </div>

            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onScan={setBarcode}
            />
        </form>
    );
}
