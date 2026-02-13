import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const validate =
    (schema: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
        await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.issues.map((e: any) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
            }
            next(error);
        }
    };
