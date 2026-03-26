import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import sendResponse from "../utils/api.response.js";
import { logService } from "../services/log.service.js";

export interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    await logService.createSystemLog({
      eventType: "UNAUTHORIZED_ACCESS_ATTEMPT",
      targetId: null as any,
      severity: "WARNING",
      message: "Missing or invalid Authorization header",
      meta: { ip: req.ip, originalUrl: req.originalUrl }
    });
    return sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: "Not authorized. Please provide a valid Bearer token in the Authorization header.",
    });
  }

  // console.log("Authorization Header:", authHeader); // Debugging log
  const token = authHeader.split(" ")[1];

  if (!token) {
    await logService.createSystemLog({
      eventType: "UNAUTHORIZED_ACCESS_ATTEMPT",
      targetId: null as any,
      severity: "WARNING",
      message: "Token missing from Authorization header",
      meta: { ip: req.ip, originalUrl: req.originalUrl }
    });
    return sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: "Not authorized. Token is missing.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    req.user = decoded;
    next();
  } catch (err: any) {
    await logService.createSystemLog({
      eventType: "UNAUTHORIZED_ACCESS_ATTEMPT",
      targetId: null as any,
      severity: "WARNING",
      message: `Invalid or expired token: ${err.message}`,
      meta: { ip: req.ip, originalUrl: req.originalUrl, error: err.message }
    });
    return sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
