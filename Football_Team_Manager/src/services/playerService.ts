import type { Player, SpainPlayer, TopPlayer } from "../interfaces/Player.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { AppError, NotFound } from "../utils/AppError.js";
import type { CreatePlayerDTO } from "../validations/player.validation.js";

export class PlayerService {
    static createPlayer = async (playerData: CreatePlayerDTO): Promise<Player> => {
        try {
            const newPlayer = new PlayerModel(playerData);
            await newPlayer.save();
            return newPlayer.toJSON() as Player;
        } catch (error) {
            throw new AppError(`Error creating player: ${(error as Error).message}`, 500);
        }
    };

    static getPlayerByTeam = async (teamId: string): Promise<Player[]> => {
        try {
            const players = await PlayerModel.find({ teamId });
            if (players.length === 0) {
                throw new NotFound("Error fetching players by team: No players found");
            }
            return players.map((player) => player.toJSON() as Player);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error fetching players by team: ${(error as Error).message}`, 500);
        }
    };

    static getPlayersByName = async (playerName: string): Promise<Player[]> => {
        try {
            const regex = new RegExp(playerName, "i");
            const players = await PlayerModel.find({ $or: [{ firstName: regex }, { lastName: regex }] });
            if (players.length === 0) {
                throw new NotFound("Error fetching players by name: Can't find a player");
            }
            return players.map((player) => player.toJSON() as Player);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error fetching players by name: ${(error as Error).message}`, 500);
        }
    };

    static getPlayerByNumber = async (teamId: string, playerNumber: number): Promise<Player[]> => {
        try {
            const players = await PlayerModel.find({ teamId: teamId, number: { $gte: playerNumber } });
            if (players.length === 0) {
                throw new NotFound("Error fetching player by number: Players not found");
            }
            const result = players.map((player) => player.toJSON() as Player);
            return result;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error fetching player by number: ${(error as Error).message}`, 500);
        }
    };

    static getAllSpainPlayers = async (): Promise<SpainPlayer[]> => {
        try {
            const players: SpainPlayer[] = await PlayerModel.aggregate([
                { $match: { nationality: "Spain" } },
                {
                    $lookup: {
                        from: "teams",
                        localField: "teamId",
                        foreignField: "_id",
                        as: "teamData",
                    },
                },
                { $unwind: "$teamData" },
                {
                    $project: {
                        _id: 0,
                        fullName: { $concat: ["$firstName", " ", "$lastName"] },
                        teamName: "$teamData.name",
                    },
                },
            ]);
            if (players.length === 0) {
                throw new NotFound("players Spain not found");
            }
            return players;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error get players Spain: ${(error as Error).message}`, 500);
        }
    };

    static getTop3MostExpensive = async (): Promise<Player[]> => {
        try {
            const players: Player[] = await PlayerModel.aggregate([
                { $match: { nationality: { $ne: "Spain" } } },
                { $sort: { cost: -1 } },
                { $limit: 3 },
            ]);
            if (players.length === 0) {
                throw new NotFound("3 players not found");
            }
            return players;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error get top 3 expensive players: ${(error as Error).message}`, 500);
        }
    };

    static getTopScorersByNationality = async (nationality: string): Promise<TopPlayer[]> => {
        try {
            const topPlayers: TopPlayer[] = await PlayerModel.aggregate([
                { $match: { nationality } },
                { $sort: { goalsScored: -1 } },
                { $limit: 3 },
                {
                    $project: {
                        _id: 0,
                        playerId: 1,
                        firstName: 1,
                        lastName: 1,
                        goalsScored: 1,
                    },
                },
            ]);
            if (topPlayers.length === 0) {
                throw new NotFound("Error get 3 top players: not found players");
            }
            return topPlayers;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error get 3 top players: ${(error as Error).message}`, 500);
        }
    };

    static getMostEfficientPlayers = async (minMatches: number = 10, limit: number = 5): Promise<Player[]> => {
        try {
            const players: Player[] = await PlayerModel.aggregate([
                { $match: { matchesPlayed: { $gte: minMatches } } },
                {
                    $addFields: {
                        goalsPerMatch: {
                            $divide: ["$goalsScored", "$matchesPlayed"],
                        },
                    },
                },
                { $sort: { goalsPerMatch: -1 } },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        __v: 0,
                        createdAt: 0,
                        updatedAt: 0,
                    },
                },
            ]);
            if (players.length === 0) {
                throw new NotFound("Error get Most Efficient Players: players not found");
            }
            return players;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error get Most Efficient Players: ${(error as Error).message}`, 500);
        }
    };

    static transferPlayer = async (playerId: string, newTeamId: string): Promise<Player> => {
        const session = await PlayerModel.startSession();
        session.startTransaction();
        try {
            const player = await PlayerModel.findOne({ playerId });
            if (!player) {
                throw new NotFound("Error transferring player: Player not found");
            }
            const oldTeam = await TeamModel.findById(player?.teamId);
            if (!oldTeam) {
                throw new NotFound("Error transferring player: Old team not found");
            }
            const newTeam = await TeamModel.findById(newTeamId);
            if (!newTeam) {
                throw new NotFound("Error transferring player: New team not found");
            }
            if (newTeam.playerIds.length >= 5) {
                throw new AppError("Error transferring player: New team is full", 422);
            }
            if (player.cost > newTeam.budget) {
                throw new AppError("Error transferring player: Not enough budget to transfer this player", 422);
            }
            player.teamId = newTeamId;
            newTeam.playerIds.push(playerId);
            newTeam.budget -= player.cost;
            oldTeam.playerIds = oldTeam.playerIds.filter((id) => id.toString() !== playerId);
            oldTeam.budget += player.cost;
            await oldTeam.save({ session });
            await newTeam.save({ session });
            await player.save({ session });
            await session.commitTransaction();
            return player.toJSON() as Player;
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error transferring player: ${(error as Error).message}`, 500);
        } finally {
            session.endSession();
        }
    };

    static deletePlayer = async (playerId: string): Promise<void> => {
        const session = await PlayerModel.startSession();
        session.startTransaction();
        try {
            const player = await PlayerModel.findOne({ playerId });
            if (!player) {
                throw new NotFound("Error deleting player: Player not found");
            }
            const team = await TeamModel.findById(player.teamId);
            if (!team) {
                throw new NotFound("Error deleting player: Team not found");
            }
            team.playerIds = team.playerIds.filter((id) => id.toString() !== playerId);
            team.budget += player.cost;
            await team.save({ session });
            await PlayerModel.deleteOne({ playerId: playerId }, { session });
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`Error deleting player: ${(error as Error).message}`, 500);
        } finally {
            session.endSession();
        }
    };
}
