import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next): void => {

    if (err.name === "MongoServerError" && err.code === 11000) {
        logger.error("MongoDB Duplicate Key Error:", { message: err.message, stack: err.stack });
        res.status(409).json({ error: "Conflict: Duplicate value entered" });
        return;
    }
    
    if (err.name === "ValidationError") {
        logger.error("Mongoose Validation Error:", { message: err.message, stack: err.stack });
        res.status(400).json({ error: "Bad Request: Validation failed" });
        return;
    }

    if (err instanceof ZodError) {
        logger.error("Validation Error:", { issues: err.issues });
        res.status(400).json({ errors: err.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) });
        return;
    }

    if (err instanceof AppError) {
        if (err.statusCode === 500) {
            logger.error("Server Error:", { message: err.message, stack: err.stack });
            res.status(500).json({ error: "Internal Server Error" });
            return;
        } else {
            logger.error("AppError:", { statusCode: err.statusCode, message: err.message, stack: err.stack });
            res.status(err.statusCode).json({ errors: err.message });
            return;
        }
    }

    logger.error("Unexpected System Error:", { message: err.message, stack: err.stack });
    res.status(500).json({ error: "Internal Server Error" });
    return;
};
