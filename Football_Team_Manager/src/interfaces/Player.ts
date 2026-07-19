export interface Player {
    playerId: string;
    _id?: string;
    firstName: string;
    lastName: string;
    nationality: string;
    number: number;
    cost: number;
    teamId?: string;
    averageRating: number;
    goalsScored: number;
    matchesPlayed: number;
}

export interface SpainPlayer {
    fullName: string;
    teamName: string;
}
