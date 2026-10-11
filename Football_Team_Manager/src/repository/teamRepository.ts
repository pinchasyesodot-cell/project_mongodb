import { Types, type ClientSession } from "mongoose";
import type { AverageTeam, CountryRepresentation, Team } from "../interfaces/Team.js";
import { TeamModel } from "../models/Team.js";
import type { CreateTeamDTO } from "../validations/team.validation.js";
import { PlayerModel } from "../models/Player.js";

export class TeamRepository {
    static saveTeam = async (team: CreateTeamDTO): Promise<Team> => {
        const newTeam = new TeamModel(team);
        await newTeam.save();
        return newTeam.toJSON() as Team;
    };

    static findTeamById = async (teamId: string, session: ClientSession): Promise<Team | null> => {
        const team = await TeamModel.findById(teamId).lean().select("-__v -createdAt -updatedAt").session(session);
        return team ? (team as Team) : null;
    };

    static updateTeamAfterAddingPlayer = async (
        teamId: string,
        playerId: string,
        playerCost: number,
        session: ClientSession
    ): Promise<Team | null> => {
        const team = (await TeamModel.findOneAndUpdate(
            { _id: teamId, budget: { $gte: playerCost }, $expr: { $lt: [{ $size: "$playerIds" }, 5] } },
            {
                $push: { playerIds: playerId },
                $inc: { budget: -playerCost },
            },
            { new: true }
        )
            .lean()
            .select("-__v -createdAt -updatedAt")
            .session(session)) as Team | null;
        return team;
    };

    static updateTeamAfterRemovePlayer = async (
        teamId: string,
        playerId: string,
        playerCost: number,
        session: ClientSession
    ): Promise<Team | null> => {
        const team = (await TeamModel.findByIdAndUpdate(
            teamId,
            { $pull: { playerIds: playerId }, $inc: { budget: playerCost } },
            { new: true }
        )
            .session(session)
            .lean()
            .select("-__v -createdAt -updatedAt")) as Team | null;
        return team;
    };

    static getTeamsBrzilianPlayers = async (session: ClientSession): Promise<Team[]> => {
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
        ]).session(session);
        return teams;
    };

    static getAverageTeamPerformance = async (
        teamId: string,
        session: ClientSession
    ): Promise<AverageTeam | undefined> => {
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
        ]).session(session);
        const [result] = stats;
        return result;
    };

    static getCountryRepresentation = async (session: ClientSession): Promise<CountryRepresentation[]> => {
        const representation: CountryRepresentation[] = await TeamModel.aggregate([
            {
                $group: {
                    _id: "$country",
                    teamCount: { $sum: 1 },
                },
            },
            { $sort: { teamCount: -1 } },
            { $project: { _id: 0, country: "$_id", teamCount: 1 } },
        ]).session(session);
        return representation;
    };

    static deleteTeam = async (teamId: string, session: ClientSession) => {
        await PlayerModel.updateMany({ teamId }, { $set: { teamId: null } }, { session });
        await TeamModel.deleteOne({ _id: teamId }, { session });
    };
}
