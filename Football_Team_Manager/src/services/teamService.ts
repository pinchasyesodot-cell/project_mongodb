import type { Team } from "../interfaces/Team.js";
import { PlayerModel } from "../models/Player.js";
import { TeamModel } from "../models/Team.js";
import { startSession } from "mongoose";

export class TeamService {
    static createTeam = async (teamData: Team): Promise<Team> => {
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
            const player = await PlayerModel.findById(playerId).session(session);
            if (!team) {
                throw new Error("Team not found");
            }
            if (!player) {
                throw new Error("Player not found");
            }
            if (team.playerIds.length >= 5) {
                throw new Error("Team is full");
            }
            if (player.cost > team.budget) {
                throw new Error(" Not enough budget to add this player");
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
                throw new Error("Team not found");
            }
            const players = await PlayerModel.updateMany({ teamId: teamId }, { $unset: { teamId: "" } }, { session });
            await TeamModel.deleteOne({ _id: teamId }, { session });
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw new Error(`Error deleting team: ${(error as Error).message}`);
        } finally {
            session.endSession();
        }
    };
}
