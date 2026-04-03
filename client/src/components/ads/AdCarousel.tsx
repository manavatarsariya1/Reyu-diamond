import { useEffect, useState, useCallback } from 'react';
import { adService } from "@/api/adService";
import type { Advertisement } from "@/api/adService";
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AdCarouselProps {
    section?: 'HOME_DASHBOARD' | 'MARKETPLACE' | 'BANNER_ZONES';
    className?: string;
}

export default function AdCarousel({ section, className }: AdCarouselProps) {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const fetchAds = useCallback(async () => {
        try {
            const response = await adService.getActiveAdvertisements(section);
            if (response.success && response.data.length > 0) {
                setAds(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch ads:", error);
        } finally {
            setLoading(false);
        }
    }, [section]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);

    useEffect(() => {
        if (ads.length <= 1) return;
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [ads.length]);

    if (loading || ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className={cn("w-full max-w-5xl mx-auto py-8", className)}>
            <div className="relative group p-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAd._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.15)]"
                    >
                        <div className="flex flex-col md:flex-row min-h-[360px]">
                            {/* Visual Section - Left Side */}
                            <div className="md:w-[45%] relative overflow-hidden bg-slate-50">
                                {currentAd.mediaType === 'video' ? (
                                    <video
                                        src={currentAd.mediaUrl}
                                        autoPlay
                                        loop
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full relative">
                                        <img
                                            src={currentAd.mediaUrl || "/assets/luxury-diamond-ad-bg.png"}
                                            alt={currentAd.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/assets/luxury-diamond-ad-bg.png";
                                            }}
                                        />
                                        {/* Subtle elegant gloss effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                                    </div>
                                )}
                                
                                {/* Refined Sponsored Badge */}
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-[10px] font-bold text-white uppercase tracking-[0.2em] shadow-lg">
                                        <Info className="w-3 h-3 text-blue-400" />
                                        Sponsored
                                    </div>
                                </div>
                            </div>

                            {/* Content Section - Right Side */}
                            <div className="flex-1 p-10 md:p-14 flex flex-col justify-center bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                                <div className="max-w-md space-y-6">
                                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                        {currentAd.title || "Exclusive Diamond Discovery"}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed line-clamp-2">
                                        {currentAd.description || "Indulge in the finest selection of certified diamonds curated for the most discerning collectors."}
                                    </p>
                                    
                                    <div className="pt-8 flex flex-wrap items-center gap-6">
                                        {currentAd.ctaLink && (
                                            <Button 
                                                asChild 
                                                className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold h-14 px-10 rounded-full shadow-2xl shadow-slate-200 dark:shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 text-base"
                                            >
                                                <a href={currentAd.ctaLink} target="_blank" rel="noopener noreferrer">
                                                    Explore Now
                                                </a>
                                            </Button>
                                        )}
                                        
                                        {/* Elegant Navigation Arrows */}
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={prevSlide}
                                                className="group w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition-all duration-300 active:scale-90"
                                            >
                                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                                            </button>
                                            <button 
                                                onClick={nextSlide}
                                                className="group w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition-all duration-300 active:scale-90"
                                            >
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimalist Silver Progress Bar */}
                        <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                key={currentIndex}
                                transition={{ duration: 6, ease: "linear" }}
                                className="h-full bg-slate-400 dark:bg-blue-500" 
                             />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Refined Dots Pagination */}
                {ads.length > 1 && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                        {ads.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "transition-all duration-500 h-1 rounded-full",
                                    currentIndex === idx ? "w-12 bg-slate-400 dark:bg-blue-500" : "w-3 bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
