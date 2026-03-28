import { useState, useEffect } from "react";
import { adService } from "@/api/adService";
import type { Advertisement } from "@/api/adService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone, Loader2, Video, ExternalLink, Trash2, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AdSubmissionForm from "@/components/ads/AdSubmissionForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdManagementPage() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchMyAds = async () => {
        setIsLoading(true);
        try {
            const response = await adService.getMyAdvertisements();
            if (response.success) {
                setAds(response.data.advertisements || []);
            }
        } catch (error) {
            console.error("Failed to fetch ads", error);
            toast.error("Failed to load advertisements");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyAds();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this promotion?")) return;

        setDeletingId(id);
        try {
            const response = await adService.deleteAdvertisement(id);
            if (response.success) {
                toast.success("Promotion deleted");
                setAds(prev => prev.filter(ad => ad._id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 space-y-10">
            {/* Header section - Clean & Simple */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Campaigns</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and monitor your marketplace promotions.</p>
                </div>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-blue-500/10 transition-transform active:scale-95">
                            <Plus className="w-5 h-5 mr-2" />
                            New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl p-0 border-none bg-transparent">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl">
                            <AdSubmissionForm onSuccess={() => {
                                setIsFormOpen(false);
                                fetchMyAds();
                            }} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Loading campaigns...</p>
                </div>
            ) : ads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {ads.map((ad, idx) => (
                            <motion.div
                                key={ad._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                                <Card className="group border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full">
                                    {/* Minimal Media Box */}
                                    <div className="aspect-[16/10] relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
                                        {ad.mediaType === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Video className="w-10 h-10 text-slate-300" />
                                            </div>
                                        ) : (
                                            <img 
                                                src={ad.mediaUrl} 
                                                alt={ad.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        )}
                                        
                                        <div className="absolute top-3 right-3 z-10">
                                            <StatusBadge status={ad.status} />
                                        </div>
                                        
                                        {/* Quick Delete */}
                                        <button 
                                            onClick={(e) => handleDelete(ad._id, e)}
                                            disabled={deletingId === ad._id}
                                            className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg text-slate-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            {deletingId === ad._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {/* Clean Content */}
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{ad.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{ad.description || "Perfect advertisement for your collection."}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {ad.bannerSection.map(section => (
                                                    <span key={section} className="text-[10px] font-black text-slate-400 uppercase tracking-tight bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        {section.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(ad.createdAt), 'MMM d, yyyy')}
                                            </div>
                                            
                                            {ad.ctaLink && (
                                                <a 
                                                    href={ad.ctaLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-full transition-colors"
                                                    title="Open Link"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        {ad.status === 'REJECTED' && ad.rejectionReason && (
                                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">"{ad.rejectionReason}"</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    
                                    {/* Action Bar */}
                                    <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                                        <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase flex items-center gap-1 transition-colors">
                                            <BarChart3 className="w-3 h-3" />
                                            Stats
                                        </button>
                                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase">
                                            Edit Details
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="py-24 text-center rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <div className="max-w-xs mx-auto space-y-6">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Megaphone className="w-9 h-9 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active promotions</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Reach more diamond buyers by launching your first campaign today.</p>
                        </div>
                        <Button onClick={() => setIsFormOpen(true)} variant="outline" className="h-11 px-8 rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50">
                            Get Started
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'APPROVED':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200">Active</span>;
        case 'PENDING':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-amber-100 text-amber-700 shadow-sm border border-amber-200">In Review</span>;
        case 'REJECTED':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-100 text-red-700 shadow-sm border border-red-200">Rejected</span>;
        case 'DISABLED':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 shadow-sm border border-slate-200">Paused</span>;
        default:
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">{status}</span>;
    }
}
