import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema, source: "body" | "query" | "params") => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        req[source] = await schema.parseAsync(req[source]);
        return next();
    };
};
