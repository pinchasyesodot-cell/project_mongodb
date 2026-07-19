import type { Player } from "../interfaces/Player.js";
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
