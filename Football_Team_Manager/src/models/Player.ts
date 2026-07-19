import { model, Schema } from "mongoose";
import type { Player } from "../interfaces/Player.js";

const Player = new Schema<Player>(
    {
        playerId: { type: String, required: true, unique: true, minlength: 9, maxlength: 9 },
        firstName: { type: String, required: true, index: true },
        lastName: { type: String, required: true, index: true },
        nationality: { type: String, required: true },
        number: { type: Number, required: true },
        cost: { type: Number, required: true },
        teamId: { type: String, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: Record<string, any>) => {
                delete ret.__v;
                delete ret._id;
                delete ret.createdAt;
                delete ret.updatedAt;
                return ret;
            },
        },
    }
);
Player.index({ nationality: 1, teamId: 1 });
Player.index({ teamId: 1, number: 1 });
export const PlayerModel = model<Player>("Player", Player);
