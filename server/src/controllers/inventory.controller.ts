// with link


import type { Request, Response, NextFunction } from "express"
import sendResponse from "../utils/api.response.js"
import { createInventoryService, getAllInventoriesService, updateInventoryService, findInventoryById, deleteInventoryService } from "../services/inventory.service.js"
import { generateUniqueBarcode } from "../utils/barcode.util.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import mongoose from "mongoose";
import { checkAndNotifyRequirements } from "../services/notification.service.js";

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const barcode = await generateUniqueBarcode();

    // Upload images and video if present
    let imageUrls: string[] = [];
    let videoUrl: string | undefined;

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.images) {
        imageUrls = await Promise.all(
          files.images.map((file) => uploadToCloudinary(file, "inventory/images"))
        );
      }

      if (files.video && files.video.length > 0) {
        videoUrl = await uploadToCloudinary(files.video[0] as Express.Multer.File, "inventory/videos", "auto");
      }
    }

    const inventory = await createInventoryService(
      userId,
      barcode,
      req.body,
      imageUrls,
      videoUrl
    );

    // Check for matching requirements and notify users - nofification
    checkAndNotifyRequirements(inventory).catch((err: any) =>
      console.error("Error in checkAndNotifyRequirements background task:", err)
    );

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      data: inventory,
      message: "Inventory created successfully",
    });
  } catch (error) {
    next(Object.assign(new Error("Failed to create inventory"), { statusCode: 500 }));
  }
};

export const getAllInventories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const requirements = await getAllInventoriesService(filters);
    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: requirements,
      message: "All Inventories fetched successfully",
    });
  } catch (error) {
    next(Object.assign(new Error("Failed to fetch inventories"), { statusCode: 500 }));
  }
};

export const getInventoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    if (!id || typeof id !== "string") {
      next(Object.assign(new Error("Inventory ID is required"), { statusCode: 400 }));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(Object.assign(new Error("Invalid inventory ID format"), { statusCode: 400 }));
    }
    const inventory = await findInventoryById(id);

    if (!inventory) {
      next(Object.assign(new Error("Inventory not found"), { statusCode: 404 }));
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Inventory fetched successfully",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
}

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user.id;
    const userRole = (req as any).userRole;

    if (!id || typeof id !== "string") {
      next(Object.assign(new Error("Inventory ID is required"), { statusCode: 400 }));
    }

    const updatedItem = await updateInventoryService(
      id,
      userId,
      req.body,
      userRole
    );

    if (!updatedItem) {
      next(Object.assign(new Error("Inventory not found or unauthorized"), { statusCode: 404 }));
    }

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: updatedItem,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).user.id;
    const userRole = (req as any).userRole;
    if (!id || typeof id !== "string") {
      next(Object.assign(new Error("Inventory ID is required"), { statusCode: 400 }));
    }
    const deletedInventory = await deleteInventoryService(userId, id, userRole);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: deletedInventory,
      message: "Inventory deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const getInventorySEO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).send("ID is required");
    }
    const inventory = await findInventoryById(id);

    if (!inventory) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(`
<!DOCTYPE html>
<html>
<head><title>Inventory Not Found</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h1>Inventory Not Found</h1>
  <p>The shared diamond listing could not be located or has been removed.</p>
  <a href="/">Go to Home</a>
</body>
</html>
      `);
    }

    const title = `${inventory.carat}ct ${inventory.shape} Diamond - ${inventory.title}`;
    const description = `${inventory.cut} Cut, ${inventory.color} Color, ${inventory.clarity} Clarity. Certified by ${inventory.lab}. Price: $${inventory.price.toLocaleString()}`;
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, "");
    const redirectUrl = `${clientUrl}/marketplace/${id}`;

    const rawImage = inventory.images?.[0] || "";
    const imageUrl = rawImage
      ? rawImage.replace('/upload/', '/upload/f_jpg,w_1200,h_630,c_fill/')
      : "";
    // ✅ Correct - use video URL as-is
    const videoUrl = inventory?.video || "";
    console.log("SEO imageUrl:", imageUrl);
    console.log("SEO videoUrl:", videoUrl);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Diamond Details'}</title>

    <!-- Open Graph / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${redirectUrl}">r
    <meta property="og:site_name" content="Reyu Diamond">
    <meta property="og:title" content="${title || ''}">
    <meta property="og:description" content="${description || ''}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="400">
    <meta property="og:image:alt" content="${title || ''}">
${videoUrl ? `
<meta property="og:video" content="${videoUrl}">
<meta property="og:video:secure_url" content="${videoUrl}">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="1200">
<meta property="og:video:height" content="630">
` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${redirectUrl}">
    <meta name="twitter:title" content="${title || ''}">
    <meta name="twitter:description" content="${description || ''}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Redirect -->
<meta http-equiv="refresh" content="2;url=${redirectUrl}">
    <script type="text/javascript">
        window.location.href = "${redirectUrl}";
    </script>
</head>
<body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh;">
    <div style="text-align: center;">
        <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};
// ```

// After restarting your server, send the link with `?v=4` at the end in a **new WhatsApp message** to bypass cache:
// ```
https://your-ngrok.app/api/inventory/seo/69ce9059bfa38d75ace51e8b?v=4