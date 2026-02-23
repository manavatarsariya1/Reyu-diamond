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