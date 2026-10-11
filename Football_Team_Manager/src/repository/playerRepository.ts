import type { ClientSession } from "mongoose";
import type { Player, SpainPlayer, TopPlayer } from "../interfaces/Player.js";
import { PlayerModel } from "../models/Player.js";
import type { CreatePlayerDTO } from "../validations/player.validation.js";

export class PlayerRepository {
    static savePlayer = async (playerData: CreatePlayerDTO, session: ClientSession): Promise<Player> => {
        const newPlayer = new PlayerModel(playerData);
        await newPlayer.save({ session });
        return newPlayer.toJSON() as Player;
    };

    static findPlayerById = async (playerId: string, session: ClientSession): Promise<Player | null> => {
        const player = await PlayerModel.findOne({ playerId })
            .lean()
            .select("-__v -createdAt -updatedAt")
            .session(session);
        return player ? (player as Player) : null;
    };

    static addGameToPlayer = async (
        playerId: string,
        averageRating: number,
        goalsScored: number,
        matchesPlayed: number,
        session: ClientSession
    ): Promise<Player> => {
        const player = (await PlayerModel.findOneAndUpdate(
            { playerId },
            { $set: { averageRating, goalsScored, matchesPlayed } },
            { new: true }
        )
            .lean()
            .select("-_id -__v -createdAt -updatedAt")
            .session(session)) as Player;
        return player;
    };

    static getPlayersByTeam = async (teamId: string): Promise<Player[]> => {
        const players = (await PlayerModel.find({ teamId })
            .lean()
            .select("-_id -__v -createdAt -updatedAt")) as Player[];
        return players;
    };

    static getPlayerByName = async (regex: RegExp): Promise<Player[]> => {
        const players = (await PlayerModel.find({ $or: [{ firstName: regex }, { lastName: regex }] })
            .lean()
            .select("-_id -__v -createdAt -updatedAt")) as Player[];
        return players;
    };

    static getPlayerByNumber = async (teamId: string, playerNumber: number): Promise<Player[]> => {
        const players = (await PlayerModel.find({ teamId: teamId, number: { $gte: playerNumber } })
            .lean()
            .select("-_id -__v -createdAt -updatedAt")) as Player[];
        return players;
    };

    static getAllSpainPlayers = async (): Promise<SpainPlayer[]> => {
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
        return players;
    };

    static getTop3MostExpensive = async (): Promise<Player[]> => {
        const players = (await PlayerModel.find({ nationality: { $ne: "Spain" } })
            .sort({ cost: -1 })
            .limit(3)
            .lean()
            .select("-_id -__v -createdAt -updatedAt")) as Player[];
        return players;
    };

    static getTopScorersByNationality = async (nationality: string): Promise<TopPlayer[]> => {
        const players = (await PlayerModel.find({ nationality })
            .sort({ goalsScored: -1 })
            .limit(3)
            .lean()
            .select("-_id playerId firstName lastName goalsScored")) as TopPlayer[];
        return players;
    };

    static getMostEfficientPlayers = async (minMatches: number, limit: number): Promise<Player[]> => {
        const players: Player[] = await PlayerModel.aggregate([
            { $match: { matchesPlayed: { $gte: minMatches } } },
            {
                $addFields: {
                    goalsPerMatch: {
                        $cond: {
                            if: { $eq: ["$matchesPlayed", 0] },
                            then: 0,
                            else: { $divide: ["$goalsScored", "$matchesPlayed"] },
                        },
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
        return players;
    };

    static updatePlayerTeamId = async (
        playerId: string,
        teamId: string,
        session: ClientSession
    ): Promise<Player | null> => {
        const player = (await PlayerModel.findOneAndUpdate(
            { playerId, teamId: null },
            { $set: { teamId } },
            { new: true }
        )
            .lean()
            .select("-_id -__v -createdAt -updatedAt")
            .session(session)) as Player | null;
        return player;
    };

    static updatePlayerAfterRemoveTeam = async (playerId: string, seession: ClientSession): Promise<Player | null> => {
        const player = (await PlayerModel.findOneAndUpdate({ playerId }, { $set: { teamId: null } })
            .lean()
            .select("-_id -__v -createdAt -updatedAt")
            .session(seession)) as Player | null;
        return player;
    };

    static updateManyPlayersTeamId = async (
        playersIds: string[],
        teamId: string,
        session: ClientSession
    ): Promise<void> => {
        await PlayerModel.updateMany({ playerId: { $in: playersIds } }, { $set: { teamId } }, { session });
    };

    static deletePlayer = async (playerId: string, session: ClientSession) => {
        await PlayerModel.deleteOne({ playerId }, { session });
    };
}
