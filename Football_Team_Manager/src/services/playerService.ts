import type { ClientSession } from "mongoose";
import type { Player, SpainPlayer, TopPlayer } from "../interfaces/Player.js";
import type { Team } from "../interfaces/Team.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { PlayerRepository } from "../repository/playerRepository.js";
import { TeamRepository } from "../repository/teamRepository.js";
import { AppError, NotFound } from "../utils/AppError.js";
import { withTransaction } from "../utils/transaction.js";
import type { CreatePlayerDTO } from "../validations/player.validation.js";

export class PlayerService {
    static createPlayer = async (playerData: CreatePlayerDTO): Promise<Player> => {
        return withTransaction(async (session) => {
            if (playerData.teamId) {
                const updateTeam = await TeamRepository.updateTeamAfterAddingPlayer(
                    playerData.teamId,
                    playerData.playerId,
                    playerData.cost,
                    session
                );
                if (!updateTeam) {
                    const team = await TeamRepository.findTeamById(playerData.teamId, session);
                    if (!team) {
                        throw new NotFound("create player: Team not found");
                    }
                    if (team.playerIds.length >= 5) {
                        throw new AppError("Team is full", 400);
                    }
                    if (playerData.cost > team.budget) {
                        throw new AppError("Not enough budget to add this player", 422);
                    }
                    throw new AppError("Failed to update team, please try again", 500);
                }
            }
            const newPlayer = await PlayerRepository.savePlayer(playerData, session);
            return newPlayer;
        });
    };

    static getPlayerByTeam = async (teamId: string): Promise<Player[]> => {
        const players = await PlayerRepository.getPlayersByTeam(teamId);
        if (players.length === 0) {
            throw new NotFound("Error fetching players by team: No players found");
        }
        return players;
    };

    static getPlayersByName = async (playerName: string): Promise<Player[]> => {
        const regex = new RegExp(playerName, "i");
        const players = await PlayerRepository.getPlayerByName(regex);
        if (players.length === 0) {
            throw new NotFound("Error fetching players by name: Can't find a player");
        }
        return players;
    };

    static getPlayerByNumber = async (teamId: string, playerNumber: number): Promise<Player[]> => {
        const players = await PlayerRepository.getPlayerByNumber(teamId, playerNumber);
        if (players.length === 0) {
            throw new NotFound("Error fetching player by number: Players not found");
        }
        return players;
    };

    static getAllSpainPlayers = async (): Promise<SpainPlayer[]> => {
        const players = await PlayerRepository.getAllSpainPlayers();
        if (players.length === 0) {
            throw new NotFound("players Spain not found");
        }
        return players;
    };

    static getTop3MostExpensive = async (): Promise<Player[]> => {
        const players = await PlayerRepository.getTop3MostExpensive();
        if (players.length === 0) {
            throw new NotFound("3 players not found");
        }
        return players;
    };

    static getTopScorersByNationality = async (nationality: string): Promise<TopPlayer[]> => {
        const topPlayers = await PlayerRepository.getTopScorersByNationality(nationality);
        if (topPlayers.length === 0) {
            throw new NotFound("Error get 3 top players: not found players");
        }
        return topPlayers;
    };

    static getMostEfficientPlayers = async (minMatches: number = 10, limit: number = 5): Promise<Player[]> => {
        const players = await PlayerRepository.getMostEfficientPlayers(minMatches, limit);
        if (players.length === 0) {
            throw new NotFound("Error get Most Efficient Players: players not found");
        }
        return players;
    };

    static transferPlayer = async (playerId: string, newTeamId: string): Promise<Player> => {
        return withTransaction(async (session) => {
            const { player } = await PlayerService.unlinkPlayerFromTeam(playerId, session);
            if (player.teamId!.toString() === newTeamId) {
                throw new AppError("Error transferring player: Player is already in the new team", 422);
            }
            const addPlayerToTeam = await PlayerService.linkPlayerToTeam(playerId, newTeamId, session);
            return addPlayerToTeam.player;
        });
    };

    static linkPlayerToTeam = async (
        playerId: string,
        teamId: string,
        session: ClientSession
    ): Promise<{
        player: Player;
        team: Team;
    }> => {
        const player = await PlayerRepository.updatePlayerTeamId(playerId, teamId, session);
        if (!player) {
            const foundPlayer = await PlayerRepository.findPlayerById(playerId, session);
            if (!foundPlayer) {
                throw new NotFound("player not found");
            }
            if (foundPlayer.teamId) {
                throw new AppError("Player already belongs to another team", 422);
            }
            throw new AppError("Failed to update player, please try again", 500);
        }
        const team = await TeamRepository.updateTeamAfterAddingPlayer(teamId, playerId, player.cost, session);
        if (!team) {
            const foundTeam = await TeamRepository.findTeamById(teamId, session);
            if (!foundTeam) {
                throw new NotFound("team not found");
            }
            if (player.cost > foundTeam.budget) {
                throw new AppError("Not enough budget to add this player", 422);
            }
            if (foundTeam.playerIds.length >= 5) {
                throw new AppError("Team is full", 400);
            }
            throw new AppError("Failed to update team, please try again", 500);
        }
        return { player, team };
    };

    static unlinkPlayerFromTeam = async (
        playerId: string,
        session: ClientSession
    ): Promise<{
        player: Player;
        team: Team;
    }> => {
        const player = await PlayerRepository.updatePlayerAfterRemoveTeam(playerId, session);
        if (!player) {
            const foundPlayer = await PlayerRepository.findPlayerById(playerId, session);
            if (!foundPlayer) {
                throw new NotFound("player not found");
            }
            throw new AppError("Failed to update player, please try again", 500);
        }
        const team = await TeamRepository.updateTeamAfterRemovePlayer(
            player.teamId!.toString(),
            playerId,
            player.cost,
            session
        );
        if (!team) {
            throw new NotFound("team not found");
        }
        return { player, team };
    };

    static deletePlayer = async (playerId: string): Promise<void> => {
        return withTransaction(async (session) => {
            const player = await PlayerRepository.findPlayerById(playerId, session);
            if (!player) {
                throw new NotFound("Error deleting player: Player not found");
            }
            if (player.teamId) {
                const team = await TeamRepository.updateTeamAfterRemovePlayer(
                    player.teamId.toString(),
                    playerId,
                    player.cost,
                    session
                );
                if (!team) {
                    throw new NotFound("Error deleting player: Team not found");
                }
            }
            await PlayerRepository.deletePlayer(playerId, session);
        });
    };
}
