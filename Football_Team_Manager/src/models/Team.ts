import { model, Schema } from "mongoose";
import type { Team } from "../interfaces/Team.js";

const Team = new Schema<Team>({
    id: { type: String, required: true , unique: true},
    name: { type: String, required: true, unique: true },
    Budget: { type: Number, required: true },
    players: { type: [String], required: true },
})

export const TeamModel = model<Team>("Team", Team);
