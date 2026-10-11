import { z } from "zod";

export const objectIdSchema = (label: string = "ID") =>
    z
        .string(`${label} must be a string`)
        .length(24, `${label} must be exactly 24 characters long`)
        .regex(/^[0-9a-fA-F]{24}$/, `${label} must be a valid MongoDB ObjectId`)
        .trim();
