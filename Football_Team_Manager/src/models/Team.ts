import { model, Schema } from "mongoose";
import type { Team } from "../interfaces/Team.js";

const Team = new Schema<Team>(
    {
        name: { type: String, required: true, unique: true },
        budget: { type: Number, required: true },
        playerIds: { type: [String], required: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: Record<string, any>) => {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
                return ret;
            },
        },
    }
);

export const TeamModel = model<Team>("Team", Team);
