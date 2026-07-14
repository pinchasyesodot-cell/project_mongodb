import type { Player } from "../interfaces/Player.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";

export class PlayerService {
    static createPlayer = async (playerData: Player): Promise<Player> => {
        try {
            const newPlayer = new PlayerModel(playerData);
            await newPlayer.save();
            return newPlayer.toJSON() as Player;
        } catch (error) {
            throw new Error(`Error creating player: ${(error as Error).message}`);
        }
    };
    static getPlayerByTeam = async (teamId: string): Promise<Player[]> => {
        try {
            const players = await PlayerModel.find({ teamId: teamId });
            return players.map((player) => player.toJSON() as Player);
        } catch (error) {
            throw new Error(`Error fetching players by team: ${(error as Error).message}`);
        }
    };
     static getPlayersByName = async ( playerName: string): Promise<Player[]> => {
            try {
                const regex = new RegExp(playerName, "i");
                const players = await PlayerModel.find({ $or: [{ firstName: regex }, { lastName: regex }] });
                return players.map((player) => player.toJSON() as Player);
            } catch (error) {
                throw new Error(`Error fetching players: ${(error as Error).message}`);
            }
        };
    static getPlayerByNumber = async (teamId: string, playerNumber: number): Promise<Player[]> => {
        try {
            const players = await PlayerModel.find({ teamId: teamId, number: { $gte: playerNumber } });
            if (players.length === 0) {
                throw new Error("Players not found");
            }
            const result = players.map((player) => player.toJSON() as Player);
            return result;
        } catch (error) {
            throw new Error(`Error fetching player by number: ${(error as Error).message}`);
        }
    };
    static transferPlayer = async (playerId: string, newTeamId: string): Promise<Player> => {
        const session = await PlayerModel.startSession();
        session.startTransaction();
        try {
            const player = await PlayerModel.findById(playerId);
            if (!player) {
                throw new Error("Player not found");
            }
            const oldTeam = await TeamModel.findById(player?.teamId);
            if (!oldTeam) {
                throw new Error("Old team not found");
            }
            const newTeam = await TeamModel.findById(newTeamId);
            if (!newTeam) {
                throw new Error("New team not found");
            }
            if (newTeam.playerIds.length >= 5) {
                throw new Error("New team is full");
            }
            if (player.cost > newTeam.budget) {
                throw new Error("Not enough budget to transfer this player");
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
            throw new Error(`Error transferring player: ${(error as Error).message}`);
        } finally {
            session.endSession();
        }
    };
    static deletePlayer = async (playerId: string): Promise<void> => {
        const session = await PlayerModel.startSession();
        session.startTransaction();
        try {
            const player = await PlayerModel.findById(playerId);
            if (!player) {
                throw new Error("Player not found");
            }
            const team = await TeamModel.findById(player.teamId);
            if (!team) {
                throw new Error("Team not found");
            }
            team.playerIds = team.playerIds.filter((id) => id.toString() !== playerId);
            team.budget += player.cost;
            await team.save({ session });
            await PlayerModel.deleteOne({ playerId: playerId }, { session });
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new Error(`Error deleting player: ${(error as Error).message}`);
        } finally {
            session.endSession();
        }
    };
}
