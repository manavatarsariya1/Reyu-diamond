import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { QrCode, Save, Gem, ImagePlus, VideoIcon, X, Film, Upload } from "lucide-react";

// Redux
import { createInventoryStart, updateInventoryStart } from "@/features/inventory/inventorySlice";
import type { RootState } from "@/app/store";

// ✅ Import shared schema directly — no duplication
import { createInventorySchema } from "../../../../backend/server/src/validation/inventory.validation";

// Extend with barcode (frontend-only field not in base schema)
const inventoryFormSchema = createInventorySchema.extend({
    barcode: z.string().min(1, "Barcode / SKU is required"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_IMAGES = 10;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi", "video/webm", "video/quicktime"];
const MAX_VIDEO_SIZE_MB = 100;

// Reuse the enum values from the schema for dropdowns
const shapeEnum = ["ROUND", "PRINCESS", "CUSHION", "EMERALD", "OVAL", "RADIANT", "ASSCHER", "MARQUISE", "HEART", "PEAR"] as const;
const cutEnum = ["EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "POOR"] as const;
const colorEnum = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] as const;
const clarityEnum = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] as const;
// const inventoryStatusEnum = ["AVAILABLE", "NOT_AVAILABLE", "LISTED", "SOLD", "ON_MEMO"] as const;

const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImageThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
    const url = URL.createObjectURL(file);
    return (
        <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
            <img src={url} alt={file.name} className="w-full h-full object-cover" />
            <button
                type="button"
                onClick={onRemove}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
                <X className="w-4 h-4 text-white" />
            </button>
        </div>
    );
}

function VideoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
    const url = URL.createObjectURL(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Film className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{sizeMB} MB</p>
            </div>
            <video src={url} className="w-16 h-10 object-cover rounded" muted />
            <button
                type="button"
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface InventoryFormProps {
    isEdit?: boolean;
    itemId?: string;
}

export function InventoryForm({ isEdit, itemId }: InventoryFormProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading } = useSelector((state: RootState) => state.inventory);

    // Find item if editing
    const currentItem = isEdit ? items.find(i => i._id === itemId) : null;
    const isLockedInAuction = currentItem && (currentItem.status === "LISTED" || currentItem.locked);

    if (isEdit && isLockedInAuction) {
        return (
            <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <Gem className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Item Locked</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                    This item is currently in an active auction or has been sold. Editing is restricted to maintain transaction integrity.
                </p>
                <Button variant="outline" onClick={() => navigate("/inventory")}>
                    Back to Inventory
                </Button>
            </div>
        );
    }

    const [scannerOpen, setScannerOpen] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<InventoryFormValues>({
        // @ts-ignore - mismatch on z.coerce.number vs react-hook-form inference
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: currentItem ? {
            title: currentItem.title,
            description: currentItem.description || "",
            barcode: currentItem.barcode,
            carat: currentItem.carat,
            cut: currentItem.cut,
            color: currentItem.color,
            clarity: currentItem.clarity,
            shape: currentItem.shape,
            lab: currentItem.lab,
            location: currentItem.location,
            price: currentItem.price,
            currency: currentItem.currency,
            status: currentItem.status,
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
        e.target.value = "";
    }, []);

    const removeImage = useCallback((index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImageError(null);
    }, []);

    const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setImageError(null);
        const dropped = Array.from(e.dataTransfer.files).filter(f => ACCEPTED_IMAGE_TYPES.includes(f.type));
        if (dropped.length === 0) { setImageError("Only JPEG, PNG, WebP, or GIF images are allowed."); return; }
        setImageFiles(prev => {
            const next = [...prev, ...dropped];
            if (next.length > MAX_IMAGES) { setImageError(`Maximum ${MAX_IMAGES} images allowed.`); return prev; }
            return next;
        });
    }, []);

    // ── Video handlers ──────────────────────────────────────────────────────

    const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoError(null);
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) { setVideoError("Only MP4, MOV, AVI, or WebM videos are allowed."); return; }
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) { setVideoError(`Video must be under ${MAX_VIDEO_SIZE_MB} MB.`); return; }
        setVideoFile(file);
        e.target.value = "";
    }, []);

    const handleVideoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setVideoError(null);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) { setVideoError("Only MP4, MOV, AVI, or WebM videos are allowed."); return; }
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) { setVideoError(`Video must be under ${MAX_VIDEO_SIZE_MB} MB.`); return; }
        setVideoFile(file);
    }, []);

    // ── Submit ──────────────────────────────────────────────────────────────

    const onSubmit = async (data: InventoryFormValues) => {
        if (isEdit && itemId) {
            dispatch(updateInventoryStart({ id: itemId, payload: data as any }));
        } else {
            const formData = new FormData();

            (Object.keys(data) as (keyof InventoryFormValues)[]).forEach(key => {
                const value = data[key];
                if (value !== undefined && value !== null) formData.append(key, String(value));
            });

            // Field names match multer config: "images" and "video"
            imageFiles.forEach(file => formData.append("images", file));
            if (videoFile) formData.append("video", videoFile);

            dispatch(createInventoryStart(formData));
        }

        // Simple success redirection timer or could listen to state
        setTimeout(() => navigate("/inventory"), 1000);
    };

    // ────────────────────────────────────────────────────────────────────────

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-6">

            {/* ── Basic Info ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Gem className="w-5 h-5 text-indigo-600" /> Basic Info
                </h3>
                <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                    <Input id="title" placeholder="e.g. 1.5ct Round Brilliant GIA" {...register("title")} />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Optional notes about the stone..." rows={3} {...register("description")} />
                </div>
            </section>

            {/* ── Specs & Details ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Specs & Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="shape">Shape <span className="text-red-500">*</span></Label>
                        <select id="shape" className={selectClass} {...register("shape")}>
                            <option value="">Select shape</option>
                            {shapeEnum.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.shape && <p className="text-xs text-red-500">{errors.shape.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carat">Carat Weight <span className="text-red-500">*</span></Label>
                        <Input id="carat" type="number" step="0.01" placeholder="1.00" {...register("carat")} />
                        {errors.carat && <p className="text-xs text-red-500">{errors.carat.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cut">Cut <span className="text-red-500">*</span></Label>
                        <select id="cut" className={selectClass} {...register("cut")}>
                            <option value="">Select cut</option>
                            {cutEnum.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                        </select>
                        {errors.cut && <p className="text-xs text-red-500">{errors.cut.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">Color <span className="text-red-500">*</span></Label>
                        <select id="color" className={selectClass} {...register("color")}>
                            <option value="">Select color</option>
                            {colorEnum.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clarity">Clarity <span className="text-red-500">*</span></Label>
                        <select id="clarity" className={selectClass} {...register("clarity")}>
                            <option value="">Select clarity</option>
                            {clarityEnum.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.clarity && <p className="text-xs text-red-500">{errors.clarity.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lab">Lab / Certification <span className="text-red-500">*</span></Label>
                        <Input id="lab" placeholder="e.g. GIA, IGI, HRD" {...register("lab")} />
                        {errors.lab && <p className="text-xs text-red-500">{errors.lab.message}</p>}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                        <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
                        {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select id="currency" className={selectClass} {...register("currency")}>
                            {["USD", "EUR", "GBP", "CAD", "AUD", "ILS"].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* ── Location & Status ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location & Status</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                        <Input id="location" placeholder="e.g. New York Vault" {...register("location")} />
                        {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                    </div>
                    {/* {isEdit && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select id="status" className={selectClass} {...register("status")}>
                                {inventoryStatusEnum.map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>
                    )} */}
                </div>
            </section>

            {/* ── Tracking / Barcode ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-600" /> Tracking
                </h3>
                <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="barcode">Barcode / SKU <span className="text-red-500">*</span></Label>
                        <Input
                            id="barcode"
                            value={barcode ?? ""}
                            placeholder="Scan or enter code..."
                            {...register("barcode")}
                            onChange={e => setValue("barcode", e.target.value, { shouldValidate: true })}
                        />
                        {errors.barcode && <p className="text-xs text-red-500">{errors.barcode.message}</p>}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
                        <QrCode className="w-4 h-4 mr-2" /> Scan
                    </Button>
                </div>
                <p className="text-xs text-gray-500">Link a physical barcode to track this item's movement.</p>
            </section>

            {/* ── Images ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-indigo-600" /> Images
                    <span className="ml-auto text-sm font-normal text-gray-400">{imageFiles.length} / {MAX_IMAGES}</span>
                </h3>
                {imageFiles.length < MAX_IMAGES && (
                    <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleImageDrop}
                        onClick={() => imageInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer px-6 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                    >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-indigo-600">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF — up to {MAX_IMAGES} images</p>
                        <input ref={imageInputRef} type="file" name="images" accept={ACCEPTED_IMAGE_TYPES.join(",")} multiple className="sr-only" onChange={handleImageChange} />
                    </div>
                )}
                {imageError && <p className="text-xs text-red-500">{imageError}</p>}
                {imageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {imageFiles.map((file, i) => (
                            <ImageThumb key={`${file.name}-${i}`} file={file} onRemove={() => removeImage(i)} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Video ── */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <VideoIcon className="w-5 h-5 text-indigo-600" /> Video
                    <span className="ml-1 text-sm font-normal text-gray-400">(optional)</span>
                </h3>
                {!videoFile ? (
                    <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleVideoDrop}
                        onClick={() => videoInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer px-6 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                    >
                        <Film className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-indigo-600">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">MP4, MOV, AVI, WebM — max {MAX_VIDEO_SIZE_MB} MB</p>
                        <input ref={videoInputRef} type="file" name="video" accept={ACCEPTED_VIDEO_TYPES.join(",")} className="sr-only" onChange={handleVideoChange} />
                    </div>
                ) : (
                    <VideoPreview file={videoFile} onRemove={() => setVideoFile(null)} />
                )}
                {videoError && <p className="text-xs text-red-500">{videoError}</p>}
            </section>

            {/* ── Actions ── */}
            <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => navigate("/inventory")}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : isEdit ? "Update Inventory" : "Save Inventory"}
                </Button>
            </div>

            <BarcodeScannerModal open={scannerOpen} onOpenChange={setScannerOpen} onScan={code => setValue("barcode", code, { shouldValidate: true })} />
        </form>
    );
}