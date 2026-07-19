import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next): void => {
    if (err instanceof ZodError) {
        res.status(400).json({ errors: err.issues });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ errors: err.message });
        return;
    }
    console.error(err)
    res.status(500).json({ error: "Internal Server Error" });
    return;
};
