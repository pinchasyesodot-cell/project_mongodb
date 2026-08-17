import { z } from "zod";
import { objectIdSchema } from "./helpers.validation.js";

export const createPlayerSchema = z.object({
    playerId: z.string("Player ID must be a string").length(9, "Player ID must be exactly 9 characters long").trim(),
    firstName: z
        .string("First name must be a string")
        .min(2, "First name must be at least 2 characters long")
        .max(20, "First name must be at most 20 characters long")
        .trim(),
    lastName: z
        .string("Last name must be a string")
        .min(2, "Last name must be at least 2 characters long")
        .max(20, "Last name must be at most 20 characters long")
        .trim(),
    nationality: z
        .string("Nationality must be a string")
        .min(2, "Nationality must be at least 2 characters long")
        .max(20, "Nationality must be at most 20 characters long")
        .trim(),
    number: z.coerce
        .number("Jersey number must be a number")
        .int("Jersey number must be an integer")
        .min(1, "Jersey number must be a positive integer")
        .max(99, "Jersey number must be between 1 and 99"),
    cost: z.coerce.number("Transfer cost must be a number").min(0, "Transfer cost must be a positive number"),
    teamId: objectIdSchema("Team ID").optional(),
    goalsScored: z.coerce.number("Goals Scored must be a number").min(0).default(0).optional(),
    matchesPlayed: z.coerce.number("Matches Played must be a number").min(0).default(0).optional(),
    averageRating: z.coerce
        .number("Average rating must be a number")
        .min(0, "Average rating cannot be less than 0")
        .max(10, "Average rating cannot be more than 10")
        .optional(),
});

export const playerIdParamSchema = z.object({
    playerId: z.string("Player ID must be a string").length(9, "Player ID must be exactly 9 characters long").trim(),
});

export const teamAndPlayerNumberSchema = z.object({
    teamId: objectIdSchema("Team ID"),
    playerNumber: z.coerce
        .number("Jersey number must be a number")
        .int("Jersey number must be an integer")
        .min(1, "Jersey number must be a positive integer")
        .max(99, "Jersey number must be between 1 and 99"),
});

export const playerNameParamSchema = z.object({
    name: z
        .string("Player name must be a string")
        .min(1, "name must be at least 1 characters long")
        .max(20, "name must be at most 20 characters long")
        .regex(/^[a-zA-Z]+$/)
        .trim(),
});

export const nationalityParamsSchema = z.object({
    nationality: z
        .string("Nationality must be a string")
        .min(2, "Nationality must be at least 2 characters long")
        .max(20, "Nationality must be at most 20 characters long")
        .trim(),
});

export const efficientPlayersQuerySchema = z.object({
    minMatches: z.coerce
        .number("min Matches number must be a number")
        .int("min Matches number must be an integer")
        .min(1, "min Matches must be at least 1")
        .optional(),
    limit: z.coerce
        .number("limit number must be a number")
        .int("limit number must be an integer")
        .min(1, "limit must be at least 1")
        .optional(),
});

export type CreatePlayerDTO = z.infer<typeof createPlayerSchema>;
