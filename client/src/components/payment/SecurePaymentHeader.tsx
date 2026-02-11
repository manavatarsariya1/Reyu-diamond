import { ShieldCheck, Lock } from "lucide-react";

export function SecurePaymentHeader() {
    return (
        <div className="w-full bg-slate-900 text-white py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium tracking-wide shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="opacity-90">Secure Escrow Transaction</span>
            <span className="mx-2 text-slate-600">|</span>
            <div className="flex items-center gap-1.5 opacity-75 text-xs">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL Encrypted</span>
            </div>
        </div>
    );
}
