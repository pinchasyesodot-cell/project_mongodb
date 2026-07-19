import { z } from "zod";

export const createTeamSchema = z.object({
    name: z
        .string("Team name must be a string")
        .min(2, "Team name must be at least 2 characters long")
        .max(20, "Team name must be at most 20 characters long")
        .trim(),
    budget: z.coerce.number("Budget must be a number").min(0, "Budget must be a positive number"),
    playerIds: z.array(
        z.string("Player ID must be a string").length(9, "Player ID must be exactly 9 characters long").trim()
    ),
    country: z
        .string("country must be a string")
        .min(4, "country must be at least 4 characters long")
        .max(20, "country must be at most 20 characters long")
        .trim(),
});

export const teamIdParamSchema = z.object({
    teamId: z
        .string("Team ID must be a string")
        .length(24, "Team ID must be exactly 24 characters long")
        .regex(/^[0-9a-fA-F]{24}$/, "Team ID must be a valid MongoDB ObjectId")
        .trim(),
});

export type CreateTeamDTO = z.infer<typeof createTeamSchema>;
