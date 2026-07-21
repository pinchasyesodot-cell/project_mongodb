export interface Team {
    _id?: string;
    name: string;
    budget: number;
    playerIds: string[];
    country: string;
}

export interface AverageTeam {
    teamName: string;
    averageGoalsScored: number;
    averageMatchesPlayed: number;
}
