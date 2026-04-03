import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { createAuctionStart } from "../../features/auction/auctionSlice";
import type { RootState } from "@/app/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryItem } from "../../types/inventory";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Minimum acceptable dates using local timezone offsetting to prevent past-date rejections natively
const minDate = new Date();
minDate.setHours(0, 0, 0, 0);

const auctionSchema = z.object({
    basePrice: z.coerce.number().min(1, "Base price must be greater than 0"),
    startDate: z.string().refine((val) => new Date(val) >= minDate, {
        message: "Start date cannot be in the past",
    }),
    endDate: z.string().refine((val) => new Date(val) > minDate, {
        message: "End date must be in the future",
    }),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
});

type AuctionFormValues = z.infer<typeof auctionSchema>;

interface AuctionFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    inventoryItem: InventoryItem | null;
}

export function AuctionForm({ isOpen, onOpenChange, inventoryItem }: AuctionFormProps) {
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.auction.loading);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<AuctionFormValues>({
        resolver: zodResolver(auctionSchema) as any,
        defaultValues: {
            basePrice: inventoryItem?.price || 0,
            startDate: new Date().toISOString().slice(0, 16), // datetime-local format YYYY-MM-DDTHH:mm
            endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // +1 day
        },
    });

    // Reset defaults when selected item changes
    React.useEffect(() => {
        if (inventoryItem) {
            reset({
                basePrice: inventoryItem.price || 0,
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            });
        }
    }, [inventoryItem, reset]);

    const onSubmit = (data: AuctionFormValues) => {
        if (!inventoryItem) return;

        // Dispatch create auction
        dispatch(createAuctionStart({
            inventoryId: inventoryItem._id,
            payload: {
                basePrice: data.basePrice,
                // Converting back to proper full ISO string formatting for strict mongoose Date casting
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString()
            }
        }));

        // We assume success and close for rapid UX, saga handles toast notification error
        onOpenChange(false);
    };

    if (!inventoryItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Auction</DialogTitle>
                    <DialogDescription>
                        Set the minimum starting price and duration for your {inventoryItem.carat}ct {inventoryItem.shape}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="basePrice">Starting Base Price ({inventoryItem.currency})</Label>
                        <Input
                            id="basePrice"
                            type="number"
                            step="0.01"
                            {...register("basePrice")}
                        />
                        {errors.basePrice && <p className="text-xs text-red-500">{errors.basePrice.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date & Time</Label>
                        <Input
                            id="startDate"
                            type="datetime-local"
                            {...register("startDate")}
                        />
                        {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date & Time</Label>
                        <Input
                            id="endDate"
                            type="datetime-local"
                            {...register("endDate")}
                        />
                        {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Start Auction
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
