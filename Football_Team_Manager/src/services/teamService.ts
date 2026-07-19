import type { Team } from "../interfaces/Team.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { startSession } from "mongoose";
import type { CreateTeamDTO } from "../validations/team.validation.js";
import { AppError, NotFound } from "../utils/AppError.js";

export class TeamService {
    static createTeam = async (teamData: CreateTeamDTO): Promise<Team> => {
        try {
            const newTeam = new TeamModel(teamData);
            await newTeam.save();
            return newTeam.toJSON() as Team;
        } catch (error) {
            throw new Error(`Error creating team: ${(error as Error).message}`);
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
                throw new AppError("Player is already in a team", 404);
            }
            if (team.playerIds.length >= 5) {
                throw new AppError("Team is full", 404);
            }
            if (player.cost > team.budget) {
                throw new AppError(" Not enough budget to add this player", 404);
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
            throw new Error(`Error adding player to team: ${(error as Error).message}`);
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
            throw new Error(`Error fetching top teams with Brazilian players: ${(error as Error).message}`);
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
            console.error()
            throw new Error(`Error deleting team: ${(error as Error).message}`);
        } finally {
            session.endSession();
        }
    };
}
