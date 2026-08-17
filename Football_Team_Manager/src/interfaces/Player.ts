import type { Types } from "mongoose";

export interface Player {
    playerId: string;
    _id?: Types.ObjectId;
    firstName: string;
    lastName: string;
    nationality: string;
    number: number;
    cost: number;
    teamId?: Types.ObjectId | string | null;
    averageRating: number;
    goalsScored: number;
    matchesPlayed: number;
}

export interface SpainPlayer {
    fullName: string;
    teamName: string;
}

export interface TopPlayer {
    playerId: string;
    firstName: string;
    lastName: string;
    goalsScored: number;
}
