import { model, Schema } from "mongoose";
import type { Player } from "../interfaces/Player.js";

const Player = new Schema<Player>({
    id: { type: String, required: true, unique: true, minlength: 9, maxlength: 9 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    Nationality: { type: String, required: true },
    Number: { type: Number, required: true },
    Cost: { type: Number, required: true },
    Team: { type: String, required: true },
});

export const PlayerModel = model<Player>("Player", Player);
