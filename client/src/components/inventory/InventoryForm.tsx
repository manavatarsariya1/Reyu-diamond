import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { 
    createInventoryStart, 
    updateInventoryStart,
    clearInventoryError 
} from "@/features/inventory/inventorySlice";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    X, 
    Upload, 
    Image as ImageIcon, 
    Video, 
    Loader2, 
    Plus,
    Check
} from "lucide-react";
import { toast } from "sonner";
import { createInventorySchema } from "@/validation/inventory.validation";

// Extend with barcode (frontend-only field not in base schema)
const inventoryFormSchema = createInventorySchema.extend({
    barcode: z.string().min(1, "Barcode / SKU is required"),
});

// @ts-ignore
type InventoryFormValues = z.infer<typeof inventoryFormSchema> & { [key: string]: any };

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_IMAGES = 10;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi", "video/webm", "video/quicktime"];
const MAX_VIDEO_SIZE_MB = 100;

interface InventoryFormProps {
    onSuccess?: () => void;
    currentItem?: any;
}

export function InventoryForm({ onSuccess, currentItem }: InventoryFormProps) {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.inventory);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    
    // For editing
    const [existingImages, setExistingImages] = useState<string[]>(currentItem?.images || []);
    const [existingVideo, setExistingVideo] = useState<string | null>(currentItem?.video || null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<InventoryFormValues>({
        // @ts-ignore
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: currentItem ? {
            ...currentItem,
            description: currentItem.description || "",
            images: currentItem.images || [],
            videos: currentItem.videos || [],
            currency: currentItem.currency || "USD",
            isCertificateAvailable: !!currentItem.lab,
        } : {
            currency: "USD",
            status: "AVAILABLE",
        },
    });

    const barcode = watch("barcode");

    // ── Image handlers ──────────────────────────────────────────────────────

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const incoming = Array.from(e.target.files ?? []);
        const invalid = incoming.find(f => !ACCEPTED_IMAGE_TYPES.includes(f.type));
        if (invalid) { setImageError("Only JPEG, PNG, WebP, or GIF images are allowed."); return; }
        setImageFiles(prev => {
            const next = [...prev, ...incoming];
            if (next.length > MAX_IMAGES) { setImageError(`Maximum ${MAX_IMAGES} images allowed.`); return prev; }
            return next;
        });
    }, []);

    const removeNewImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // ── Video handlers ──────────────────────────────────────────────────────

    const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
            setVideoError("Invalid video format.");
            return;
        }

        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            setVideoError(`Video must be less than ${MAX_VIDEO_SIZE_MB}MB.`);
            return;
        }

        setVideoFile(file);
    }, []);

    // ── Submission ──────────────────────────────────────────────────────────

    const onSubmit = (data: InventoryFormValues) => {
        const formData = new FormData();
        
        // Basic fields
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'images' && key !== 'video' && value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        // Add specific file handling
        imageFiles.forEach(file => formData.append('images', file));
        if (videoFile) formData.append('video', videoFile);
        
        // If editing
        if (currentItem) {
            formData.append('existingImages', JSON.stringify(existingImages));
            if (existingVideo && !videoFile) {
                formData.append('existingVideo', existingVideo);
            }
            dispatch(updateInventoryStart({ id: currentItem._id, formData }));
        } else {
            dispatch(createInventoryStart(formData));
        }
    };

    // Handle success/error feedback
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearInventoryError());
        }
    }, [error, dispatch]);

    const statusOptions = ["AVAILABLE", "LISTED", "ON_MEMO", "LOCKED", "SOLD", "AUCTION_ENDED"];
    const labs = ["GIA", "IGI", "HRD", "NONE"];
    const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
    const clarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];
    const shapes = ["ROUND", "PRINCESS", "CUSHION", "EMERALD", "OVAL", "RADIANT", "ASSCHER", "MARQUISE", "HEART", "PEAR"];
    const cuts = ["EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "POOR"];

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 bg-white p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                        <Input id="title" {...register("title")} placeholder="e.g., 1.5ct Round Brilliant Diamond" />
                        {errors.title && <p className="text-xs text-red-500">{(errors.title as any).message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Details about specific gravity, table size, etc." className="h-24" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="carat">Carat Weight <span className="text-red-500">*</span></Label>
                            <Input id="carat" type="number" step="0.01" {...register("carat")} />
                            {errors.carat && <p className="text-xs text-red-500">{(errors.carat as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shape">Shape <span className="text-red-500">*</span></Label>
                            <Select onValueChange={v => setValue("shape", v as any)} defaultValue={watch("shape")}>
                                <SelectTrigger><SelectValue placeholder="Select shape" /></SelectTrigger>
                                <SelectContent>{shapes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.shape && <p className="text-xs text-red-500">{(errors.shape as any).message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Color <span className="text-red-500">*</span></Label>
                            <Select onValueChange={v => setValue("color", v as any)} defaultValue={watch("color")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.color && <p className="text-xs text-red-500">{(errors.color as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Clarity <span className="text-red-500">*</span></Label>
                            <Select onValueChange={v => setValue("clarity", v as any)} defaultValue={watch("clarity")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{clarities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.clarity && <p className="text-xs text-red-500">{(errors.clarity as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Cut <span className="text-red-500">*</span></Label>
                            <Select onValueChange={v => setValue("cut", v as any)} defaultValue={watch("cut")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{cuts.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.cut && <p className="text-xs text-red-500">{(errors.cut as any).message}</p>}
                        </div>
                    </div>
                </div>

                {/* Specs & Pricing */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Lab <span className="text-red-500">*</span></Label>
                            <Select onValueChange={v => setValue("lab", v)} defaultValue={watch("lab")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{labs.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.lab && <p className="text-xs text-red-500">{(errors.lab as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                            <Input id="location" {...register("location")} placeholder="e.g., Surat, India" />
                            {errors.location && <p className="text-xs text-red-500">{(errors.location as any).message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                            <Input id="price" type="number" {...register("price")} />
                            {errors.price && <p className="text-xs text-red-500">{(errors.price as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select onValueChange={v => setValue("status", v as any)} defaultValue={watch("status")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-red-500">{(errors.status as any).message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode / SKU <span className="text-red-500">*</span></Label>
                        <Input 
                            id="barcode" 
                            value={(barcode as string) || ""} 
                            placeholder="Scan or enter code..." 
                            {...register("barcode")}
                            onChange={e => setValue("barcode", e.target.value, { shouldValidate: true })}
                        />
                        {errors.barcode && <p className="text-xs text-red-500">{(errors.barcode as any).message}</p>}
                    </div>

                    {/* Media Uploads */}
                    <div className="space-y-4">
                        <Label>Media</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()} className="h-20 border-dashed">
                                <Upload className="mr-2 h-4 w-4" /> Add Images
                            </Button>
                            <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} className="h-20 border-dashed">
                                <Video className="mr-2 h-4 w-4" /> Add Video
                            </Button>
                        </div>
                        <input type="file" ref={imageInputRef} multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        <input type="file" ref={videoInputRef} accept="video/*" onChange={handleVideoChange} className="hidden" />
                    </div>
                </div>
            </div>

            {/* Media Previews */}
            <div className="space-y-4">
                {(existingImages.length > 0 || imageFiles.length > 0) && (
                    <div className="grid grid-cols-5 gap-4">
                        {existingImages.map((url, i) => (
                            <div key={`old-${i}`} className="relative h-20 rounded-lg overflow-hidden border">
                                <img src={url} className="w-full h-full object-cover" />
                                <button onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                            </div>
                        ))}
                        {imageFiles.map((file, i) => (
                            <div key={`new-${i}`} className="relative h-20 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center">
                                <ImageIcon size={20} className="text-slate-300" />
                                <button onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                            </div>
                        ))}
                    </div>
                )}
                {videoFile && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs">
                        <Video size={14} /> {videoFile.name} <button onClick={() => setVideoFile(null)}><X size={14} /></button>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="submit" disabled={loading} className="px-10 h-12 rounded-xl bg-slate-900 hover:bg-black text-white">
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                    {currentItem ? "Save Changes" : "Create Inventory"}
                </Button>
            </div>
        </form>
    );
}