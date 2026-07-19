import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema, source: "body" | "query" | "params") => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req[source]);
            return next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    errors: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
                });
                return;
            } else {
                res.status(500).json({ success: false, error: "Internal server error" });
            }
            next(error);
        }
    };
};
