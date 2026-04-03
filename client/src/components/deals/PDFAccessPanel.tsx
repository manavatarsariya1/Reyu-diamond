import { FileText, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function PDFAccessPanel() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        // Simulate download
        setTimeout(() => {
            setIsDownloading(false);
            toast.success("Deal summary downloaded securely.");
        }, 1500);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        Official Transaction Record
                        <Shield className="w-3 h-3 text-emerald-500" />
                    </h4>
                    <p className="text-sm text-slate-500">
                        Digitally signed and secured PDF summary.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleDownload}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm mt-5"
                disabled={isDownloading}
            >
                {isDownloading ? (
                    <span className="flex items-center gap-2">Generating...</span>
                ) : (
                    <>
                        <Lock className="w-3.5 h-3.5 mr-2" />
                        Download PDF
                    </>
                )}
            </Button>
        </div>
    );
}
