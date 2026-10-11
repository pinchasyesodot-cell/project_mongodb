import z from "zod";

export const createGameSchema = z.array(
    z.object({
        playerId: z
            .string("Player ID must be a string")
            .length(9, "Player ID must be exactly 9 characters long")
            .trim(),
        goalsScored: z.coerce.number("Goals Scored must be a number").min(0).default(0),
        rating: z.coerce
            .number("Average rating must be a number")
            .min(0, "Average rating cannot be less than 0")
            .max(10, "Average rating cannot be more than 10"),
    })
);

export type createGameDTO = z.infer<typeof createGameSchema>;
