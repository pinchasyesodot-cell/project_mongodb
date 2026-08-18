import type { AverageTeam, CountryRepresentation, Team } from "../interfaces/Team.js";
import type { CreateTeamDTO } from "../validations/team.validation.js";
import { AppError, NotFound } from "../utils/AppError.js";
import type { createGameDTO } from "../validations/game.validation.js";
import type { Player } from "../interfaces/Player.js";
import { withTransaction } from "../utils/transaction.js";
import { TeamRepository } from "../repository/teamRepository.js";
import { PlayerRepository } from "../repository/playerRepository.js";
import { PlayerService } from "./playerService.js";

export class TeamService {
    static createTeam = async (teamData: CreateTeamDTO): Promise<Team> => {
        return withTransaction(async (session) => {
            if (teamData.playerIds.length !== 0) {
                const playerPromises = teamData.playerIds.map((playerId) =>
                    PlayerRepository.findPlayerById(playerId, session)
                );
                const players = await Promise.all(playerPromises);
                const validPlayers = players.filter((player) => player !== null);
                const validPlayerIds = validPlayers.map((player) => player.playerId);
                teamData.playerIds = validPlayerIds;
                const totalCost = validPlayers.reduce((sum, player) => sum + player.cost, 0);
                if (totalCost > teamData.budget) {
                    throw new AppError(
                        `Not enough budget to add this players, this players cost ${totalCost} your budget is: ${teamData.budget}`,
                        422
                    );
                }
            }
            const newTeam = await TeamRepository.saveTeam(teamData);
            await PlayerRepository.updateManyPlayersTeamId(teamData.playerIds, newTeam._id, session);
            return newTeam;
        });
    };

    static addPlayerToTeam = async (teamId: string, playerId: string): Promise<Team> => {
        return withTransaction(async (session) => {
            const { team } = await PlayerService.linkPlayerToTeam(playerId, teamId, session);
            return team;
        });
    };

    static addGame = async (teamId: string, players: createGameDTO): Promise<Player[]> => {
        return withTransaction(async (session) => {
            const team = await TeamRepository.findTeamById(teamId, session);
            if (!team) {
                throw new NotFound("Team not found");
            }
            const updatePlayer = players.map(async (player) => {
                const playerData = await PlayerRepository.findPlayerById(player.playerId, session);
                if (!playerData) {
                    throw new NotFound("player not found");
                }
                const totalRating = playerData.averageRating * playerData.matchesPlayed;
                const newRating = totalRating + player.rating;
                const newGoalsScored = player.goalsScored + playerData.goalsScored;
                const totalMatchesPlayed = playerData.matchesPlayed + 1;
                const newAverageRating = newRating / totalMatchesPlayed;
                const roundRating = Math.round(newAverageRating * 100) / 100;
                const pleyerUpdate = await PlayerRepository.addGameToPlayer(
                    playerData.playerId,
                    roundRating,
                    newGoalsScored,
                    totalMatchesPlayed,
                    session
                );
                return pleyerUpdate;
            });
            const updatedPlayers = (await Promise.all(updatePlayer)) as Player[];
            return updatedPlayers;
        });
    };

    static getTopTeamsWithBrazilianPlayers = async (): Promise<Team[]> => {
        return withTransaction(async (session) => {
            const teams = await TeamRepository.getTeamsBrzilianPlayers(session);
            return teams;
        });
    };

    static getAverageTeamPerformance = async (teamId: string): Promise<AverageTeam> => {
        return withTransaction(async (session) => {
            const result = await TeamRepository.getAverageTeamPerformance(teamId, session);
            if (!result) {
                throw new NotFound("Error Average Team Performance: Team not found");
            }
            return result;
        });
    };

    static getCountryRepresentation = async (): Promise<CountryRepresentation[]> => {
        return withTransaction(async (session) => {
            const representation = await TeamRepository.getCountryRepresentation(session);
            if (representation.length === 0) {
                throw new NotFound("Error get Country Representation: team not found");
            }
            return representation;
        });
    };

    static deleteTeam = async (teamId: string): Promise<void> => {
        return withTransaction(async (session) => {
            const team = await TeamRepository.findTeamById(teamId, session);
            if (!team) {
                throw new NotFound("delete team: Team not found");
            }
            await TeamRepository.deleteTeam(teamId, session);
        });
    };
}
