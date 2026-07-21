import type { AverageTeam, CountryRepresentation, Team } from "../interfaces/Team.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { startSession, Types } from "mongoose";
import type { CreateTeamDTO } from "../validations/team.validation.js";
import { AppError, NotFound } from "../utils/AppError.js";
import type { createGameDTO } from "../validations/game.validation.js";
import type { Player } from "../interfaces/Player.js";

export class TeamService {
    static createTeam = async (teamData: CreateTeamDTO): Promise<Team> => {
        try {
            const newTeam = new TeamModel(teamData);
            await newTeam.save();
            return newTeam.toJSON() as Team;
        } catch (error) {
            throw new AppError(`Error creating team: ${(error as Error).message}`, 500);
        }
    };

    static addPlayerToTeam = async (teamId: string, playerId: string): Promise<Team | null> => {
        const session = await startSession();
        session.startTransaction();
        try {
            const team = await TeamModel.findById(teamId).session(session);
            if (!team) {
                throw new NotFound("Team not found");
            }
            const player = await PlayerModel.findOne({ playerId }).session(session);
            if (!player) {
                throw new NotFound("Player not found");
            }
            if (player.teamId) {
                throw new AppError("Player is already in a team", 409);
            }
            if (team.playerIds.length >= 5) {
                throw new AppError("Team is full", 400);
            }
            if (player.cost > team.budget) {
                throw new AppError(" Not enough budget to add this player", 422);
            }
            team.budget -= player.cost;
            team.playerIds.push(playerId);
            player.teamId = teamId;
            await player.save({ session });
            await team.save({ session });
            await session.commitTransaction();
            return team.toJSON() as Team;
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error adding player to team: ${(error as Error).message}`, 500);
        } finally {
            session.endSession();
        }
    };

    static addGame = async (teamId: string, players: createGameDTO): Promise<Player[]> => {
        const session = await startSession();
        session.startTransaction();
        try {
            const team = await TeamModel.findById(teamId).session(session);
            if (!team) {
                throw new NotFound("Team not found");
            }
            const updatePlayer = players.map(async (player) => {
                const playerData = await PlayerModel.findOne({ playerId: player.playerId }).session(session);
                if (!playerData) {
                    throw new NotFound("player not found");
                }
                const totalScore = playerData.averageRating * playerData.goalsScored;
                const newRating = totalScore + player.rating;
                const newGoalsScored = player.goalsScored + playerData.goalsScored;
                const newAverageRating = newRating / newGoalsScored;
                playerData.averageRating = newAverageRating;
                playerData.goalsScored = newGoalsScored;
                await playerData.save({ session });
                return playerData;
            });
            const updatedPlayers = (await Promise.all(updatePlayer)) as Player[];
            await session.commitTransaction();
            return updatedPlayers;
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error add a new game played by a team: ${(error as Error).message}`, 500);
        } finally {
            session.endSession();
        }
    };

    static getTopTeamsWithBrazilianPlayers = async (): Promise<Team[]> => {
        try {
            const teams: Team[] = await PlayerModel.aggregate([
                {
                    $match: {
                        nationality: "Brazil",
                    },
                },
                {
                    $group: {
                        _id: "$teamId",
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 3 },
                {
                    $lookup: {
                        from: "teams",
                        localField: "_id",
                        foreignField: "_id",
                        as: "teams",
                    },
                },
                { $unwind: "$teams" },
                { $replaceRoot: { newRoot: "$teams" } },
            ]);
            return teams;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error fetching top teams with Brazilian players: ${(error as Error).message}`, 500);
        }
    };

    static getAverageTeamPerformance = async (teamId: string): Promise<AverageTeam> => {
        const stats: AverageTeam[] = await TeamModel.aggregate([
            { $match: { _id: new Types.ObjectId(teamId) } },
            {
                $lookup: {
                    from: "players",
                    localField: "_id",
                    foreignField: "teamId",
                    as: "teamPlayers",
                },
            },
            {
                $project: {
                    _id: 0,
                    teamName: "$name",
                    averageGoalsScored: { $avg: "$teamPlayers.goalsScored" },
                    averageMatchesPlayed: { $avg: "$teamPlayers.matchesPlayed" },
                },
            },
        ]);
        const [result] = stats;
        if (!result) {
            throw new NotFound("Error Average Team Per formance: Team not found");
        }
        return {
            teamName: result.teamName,
            averageGoalsScored: result.averageGoalsScored,
            averageMatchesPlayed: result.averageMatchesPlayed,
        };
    };

    static getCountryRepresentation = async (): Promise<CountryRepresentation[]> => {
        try {
            const representation: CountryRepresentation[] = await TeamModel.aggregate([
                {
                    $group: {
                        _id: "$country",
                        teamCount: { $sum: 1 },
                    },
                },
                { $sort: { teamCount: -1 } },
                { $project: { _id: 0, country: "$_id", teamCount: 1 } },
            ]);
            if (representation.length === 0) {
                throw new NotFound("Error get Country Representation: team not found");
            }
            return representation;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error get Country Representation: ${(error as Error).message}`, 500);
        }
    };

    static deleteTeam = async (teamId: string): Promise<void> => {
        const session = await startSession();
        session.startTransaction();
        try {
            const team = await TeamModel.findById(teamId).session(session);
            if (!team) {
                throw new NotFound("Team not found");
            }
            const players = await PlayerModel.updateMany({ teamId: teamId }, { $unset: { teamId: "" } }, { session });
            await TeamModel.deleteOne({ _id: teamId }, { session });
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error deleting team: ${(error as Error).message}`, 500);
        } finally {
            session.endSession();
        }
    };
}
