import type { Request, Response, NextFunction } from "express";
import {
  createRequirementService,
  getAllRequirementsService,
  updateRequirementByIdService,
  getRequirementByIdService,
  getMyRequirementsService,
  deleteRequirementService,
} from "../services/requirement.service.js";
import sendResponse from "../utils/api.response.js";

export const createRequirement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id as string | undefined;

    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const { shape, carat, color, clarity, lab, location, budget } = req.body;

    const requirement = await createRequirementService(userId, {
      shape,
      carat,
      color,
      clarity,
      lab,
      location,
      budget,
    });

    return sendResponse({
      res,
      statusCode: 201,
      success: true,
      data: requirement,
      message: "Requirement created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRequirements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requirements = await getAllRequirementsService();
    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: requirements,
      message: "All Requirements fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequirements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requirementId = req.params.id as string;
    const updateData = req.body;

    if (!requirementId) {
      const err: any = new Error("Requirement ID is required");
      err.statusCode = 400;
      throw err;
    }

    const updatedRequirement = await updateRequirementByIdService(requirementId, updateData);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: updatedRequirement,
      message: "Requirement updated successfully",
    });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === "Invalid requirement id") {
      (error as any).statusCode = 400;
    } else if (msg === "Requirement not found") {
      (error as any).statusCode = 404;
    } else if (msg?.includes("not authorized")) {
      (error as any).statusCode = 403;
    }
    next(error);
  }
};

export const getMyRequirements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id as string | undefined;

    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const requirements = await getMyRequirementsService(userId);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: requirements,
      message: requirements.length > 0
        ? "Requirements fetched successfully"
        : "No requirements found.",
    });
  } catch (error) {
    next(error);
  }
};

export const getRequirementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requirementId = req.params.id as string;
    if (!requirementId) {
      const err: any = new Error("Requirement ID is required");
      err.statusCode = 400;
      throw err;
    }
    const requirement = await getRequirementByIdService(requirementId);
    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      data: requirement,
      message: "Requirement fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRequirement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requirementId = req.params.id as string;
    if (!requirementId) {
      const err: any = new Error("Requirement ID is required");
      err.statusCode = 400;
      throw err;
    }

    const dlt = await deleteRequirementService(requirementId);

    return sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: "Requirement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getInquirySEO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).send("ID is required");
    }
    const requirement = await getRequirementByIdService(id);

    if (!requirement) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(`
<!DOCTYPE html>
<html>
<head><title>Inquiry Not Found</title></head>
<body style="font-family: sans-serif; text-align: center; padding: 50px;">
  <h1>Inquiry Not Found</h1>
  <p>The shared inquiry could not be located or has been removed.</p>
  <a href="/">Go to Home</a>
</body>
</html>
      `);
    }

    const title = `Diamond Inquiry: ${requirement.carat}ct ${requirement.shape}`;
    const description = `${requirement.cut} Cut, ${requirement.color} Color, ${requirement.clarity} Clarity. Budget: $${requirement.budget.toLocaleString()}. Location: ${requirement.location}`;
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, "");
    const url = `${clientUrl}/inquiry/${id}`;

    // Fallback image since Requirement doesn't have an image field yet
    const imageUrl = "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1000&auto=format&fit=crop";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="Reyu Diamond">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:alt" content="${title}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">

    <!-- Redirect to the actual app -->
    <script>
        setTimeout(() => {
            window.location.href = "${url}";
        }, 500);
    </script>
</head>
<body style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; color: #1e293b;">
    <div style="max-width: 400px; width: 90%; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); text-align: center;">
        <div style="background: #eef2ff; width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <svg style="width: 32px; height: 32px; color: #4f46e5;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #111827;">Reyu Diamond</h1>
        <p style="color: #64748b; margin-bottom: 32px; line-height: 1.5;">Redirecting you to the shared inquiry details...</p>
        <div style="padding: 16px; background: #f1f5f9; border-radius: 12px; margin-bottom: 32px; text-align: left;">
            <div style="font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 4px;">${requirement.carat}ct ${requirement.shape} ${requirement.color}/${requirement.clarity}</div>
            <div style="font-size: 12px; color: #94a3b8;">Location: ${requirement.location}</div>
        </div>
        <a href="${url}" style="display: block; width: 100%; padding: 14px; background: #4f46e5; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: background 0.2s;">View Inquiry Details</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">© ${new Date().getFullYear()} Reyu Diamond. Secure & Verified.</p>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    next(error);
  }
};

