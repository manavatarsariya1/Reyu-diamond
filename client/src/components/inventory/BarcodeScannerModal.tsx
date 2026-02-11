import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (code: string) => void;
}

export function BarcodeScannerModal({ open, onOpenChange, onScan }: BarcodeScannerModalProps) {
    const [scanning, setScanning] = useState(false);
    const [scannedCode, setScannedCode] = useState<string | null>(null);

    // Reset state on open
    useEffect(() => {
        if (open) {
            setScanning(true);
            setScannedCode(null);
        } else {
            setScanning(false);
        }
    }, [open]);

    const simulateScan = () => {
        if (!scanning) return;

        // Simulate a delay usually found in scanning
        setScanning(false);
        const mockCode = `DIA-${Math.floor(Math.random() * 1000000)}`;
        setScannedCode(mockCode);

        // Auto-approve after a brief pause for effect
        setTimeout(() => {
            toast.success(`Scanned barcode: ${mockCode}`);
            onScan(mockCode);
            onOpenChange(false);
        }, 800);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription>
                        Position the barcode within the frame to scan.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-square bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center">
                    {/* Simulated Camera Feed */}
                    {scanning ? (
                        <>
                            <div className="absolute inset-0 bg-gray-900 opacity-90 animate-pulse"></div>
                            {/* Scanning Guide */}
                            <div className="absolute w-64 h-40 border-2 border-white/50 rounded-lg flex items-center justify-center">
                                <div className="w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                            </div>
                            <p className="relative z-10 text-white font-medium mt-32">Scanning...</p>

                            {/* Simulation Trigger */}
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-4 z-20"
                                onClick={simulateScan}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Simulate Scan
                            </Button>
                        </>
                    ) : scannedCode ? (
                        <div className="flex flex-col items-center text-white">
                            <div className="bg-emerald-500 rounded-full p-3 mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-bold">{scannedCode}</p>
                            <p className="text-sm opacity-80">Barcode detected!</p>
                        </div>
                    ) : null}
                </div>

                <div className="flex justify-center mt-2">
                    <p className="text-xs text-gray-500">
                        {scanning ? "Ensure sufficient lighting" : "Scan complete"}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
