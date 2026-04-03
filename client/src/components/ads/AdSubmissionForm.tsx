import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adService } from "@/api/adService";
import { inventoryService } from "@/api/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Upload, X, Film, ImageIcon, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

const adSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().max(300).optional(),
    ctaLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    bannerSection: z.array(z.string()).min(1, "Select at least one placement section"),
});

type AdFormValues = z.infer<typeof adSchema>;

interface AdSubmissionFormProps {
    onSuccess: () => void;
}

export default function AdSubmissionForm({ onSuccess }: AdSubmissionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

    const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<AdFormValues>({
        resolver: zodResolver(adSchema),
        defaultValues: {
            bannerSection: ["BANNER_ZONES"],
        }
    });

    const bannerSection = watch("bannerSection");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaType(type);
        setMediaFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
    };

    const onSubmit = async (data: AdFormValues) => {
        if (!mediaFile) {
            toast.error("Please upload a media file (Image or Video)");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            if (data.description) formData.append("description", data.description);
            if (data.ctaLink) formData.append("ctaLink", data.ctaLink);
            
            // Handle array for bannerSection
            data.bannerSection.forEach(section => {
                formData.append("bannerSection", section);
            });
            
            formData.append("media", mediaFile);

            const response = await adService.createAdvertisement(formData);
            if (response.success) {
                toast.success("Advertisement submitted for review!");
                onSuccess();
            }
        } catch (error: any) {
            console.error("Submission error", error);
            toast.error(error.response?.data?.message || "Failed to submit advertisement");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = useCallback((section: string) => {
        const currentValues = getValues("bannerSection") || [];
        const current = Array.isArray(currentValues) ? [...currentValues] : [];
        const index = current.indexOf(section);
        if (index > -1) {
            if (current.length > 1) {
                current.splice(index, 1);
            } else {
                toast.warning("At least one section must be selected");
                return;
            }
        } else {
            current.push(section);
        }
        setValue("bannerSection", current, { shouldValidate: true, shouldDirty: true });
    }, [getValues, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <div>
                <h2 className="text-xl font-bold font-luxury mb-1">Create Campaign</h2>
                <p className="text-sm text-slate-500">Reach your audience with premium placements.</p>
            </div>

            <div className="space-y-4">
                {/* Media Upload */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Promotion Media</Label>
                    {!mediaPreview ? (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 group">
                            <label className="flex flex-col items-center justify-center cursor-pointer space-y-2">
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-400">High-res Image or Video (Max 5MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 border border-slate-200 shadow-sm group">
                            {mediaType === 'video' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                                    <Film className="w-12 h-12 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">{mediaFile?.name}</p>
                                </div>
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button 
                                type="button"
                                onClick={removeMedia}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Campaign Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Summer Diamond Sale 2024"
                        className={errors.title ? "border-red-500" : "bg-slate-50/50"}
                        {...register("title")}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Describe your promotion in detail..."
                        className="bg-slate-50/50 resize-none min-h-[80px]"
                        {...register("description")}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                {/* CTA Link */}
                <div className="space-y-2">
                    <Label htmlFor="ctaLink" className="text-sm font-semibold">Call to Action Link (Optional)</Label>
                    <Input 
                        id="ctaLink" 
                        placeholder="https://yourapp.com/listings/diamond-abc"
                        className="bg-slate-50/50"
                        {...register("ctaLink")}
                    />
                    {errors.ctaLink && <p className="text-xs text-red-500 mt-1">{errors.ctaLink.message}</p>}
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Users will be redirected here when they click your ad.
                    </p>
                </div>

                {/* Placements */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">Placement Targeting</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <PlacementCard 
                            title="Home Dashboard" 
                            description="Front page placement" 
                            selected={bannerSection.includes("HOME_DASHBOARD")}
                            onClick={() => toggleSection("HOME_DASHBOARD")}
                        />
                        <PlacementCard 
                            title="Marketplace" 
                            description="Top of marketplace listings" 
                            selected={bannerSection.includes("MARKETPLACE")}
                            onClick={() => toggleSection("MARKETPLACE")}
                        />
                        <PlacementCard 
                            title="Global Banner" 
                            description="Shows in general banner areas" 
                            selected={bannerSection.includes("BANNER_ZONES")}
                            onClick={() => toggleSection("BANNER_ZONES")}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
                <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Finalizing...
                        </>
                    ) : (
                        "Submit Promotion"
                    )}
                </Button>
            </div>
        </form>
    );
}

function PlacementCard({ title, description, selected, onClick }: any) {
    return (
        <div 
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all text-left relative group overflow-hidden",
                selected 
                    ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" 
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50"
            )}
        >
            <div className="flex items-center justify-between mb-1 relative z-10">
                <p className={cn("font-bold text-sm transition-colors", selected ? "text-blue-700 dark:text-blue-400" : "text-slate-700")}>{title}</p>
                <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selected 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-slate-300 bg-white"
                )}>
                    {selected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
            </div>
            <p className="text-xs text-slate-500 relative z-10">{description}</p>
            
            {/* Visual feedback for selected state */}
            {selected && (
                <div className="absolute top-0 right-0 p-1 opacity-10">
                    <Check className="w-12 h-12 text-blue-600 rotate-12" />
                </div>
            )}
        </div>
    );
}
