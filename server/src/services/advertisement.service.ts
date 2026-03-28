import { Advertisement, type IAdvertisement } from "../models/Advertisement.model.js";
import { uploadToCloudinary } from "./cloudinary.service.js";
import mongoose from "mongoose";

// Define input type for creation
interface CreateAdvertisementInput {
    title: string;
    description?: string | undefined;
    inventoryId?: string | undefined;
    ctaLink?: string | undefined;
    bannerSection?: string[] | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    mediaUrl?: string | undefined;
    mediaType?: "image" | "video" | undefined;
}

export const createAdvertisement = async (
    advertiserId: string,
    data: CreateAdvertisementInput,
    file?: Express.Multer.File
) => {
    let mediaUrl = "";
    let mediaType = "image";

    if (file) {
        const isVideo = file.mimetype.startsWith("video");
        mediaType = isVideo ? "video" : "image";
        mediaUrl = await uploadToCloudinary(file, "advertisements", mediaType as "image" | "video");
    }

    // Optional: ownership check for inventoryId if provided
    if (data.inventoryId) {
        const inventory = await mongoose.model("Inventory").findById(data.inventoryId);
        if (!inventory || inventory.sellerId.toString() !== advertiserId) {
            throw new Error("You do not own this inventory item");
        }
    }

    const finalMediaUrl = mediaUrl || data.mediaUrl;
    if (!finalMediaUrl) {
        throw new Error("Media URL is required");
    }

    const advertisement = await Advertisement.create({
        ...data,
        advertiserId,
        mediaUrl: finalMediaUrl,
        mediaType: (mediaType || data.mediaType) as "image" | "video",
        status: "PENDING"
    } as any);

    return advertisement;
};

export const getAdvertisements = async (
    query: {
        status?: string;
        section?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        advertiserId?: string;
    }
) => {
    const { status, section, startDate, endDate, advertiserId } = query;
    const filter: any = {};

    if (advertiserId) filter.advertiserId = advertiserId;
    if (status) filter.status = status;
    if (section) filter.bannerSection = section;

    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const advertisements = await Advertisement.find(filter)
        .populate("advertiserId", "username email")
        .populate("inventoryId")
        .sort({ createdAt: -1 })

    return {
        advertisements,
    };
};

export const getAdvertisementById = async (id: string) => {
    const advertisement = await Advertisement.findById(id)
        .populate("advertiserId", "username email")
        .populate("inventoryId");

    if (!advertisement) {
        throw new Error("Advertisement not found"); // Changed to throw Error instead of HttpError, controller will catch
    }

    return advertisement;
};

export const updateAdvertisementStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "DISABLED",
    rejectionReason?: string
) => {
    const updateData: Partial<IAdvertisement> = { status };

    if (status === "REJECTED" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }

    // If approved, set start date if not present? Or maybe separate logic. 
    // For now just status update.

    const advertisement = await Advertisement.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );

    if (!advertisement) {
        throw new Error("Advertisement not found");
    }

    return advertisement;
};
export const deleteAdvertisement = async (id: string) => {
    const advertisement = await Advertisement.findByIdAndDelete(id);

    if (!advertisement) {
        throw new Error("Advertisement not found");
    }

    return advertisement;
};
