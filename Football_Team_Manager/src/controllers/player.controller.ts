import type { NextFunction, Request, Response } from "express";
import { PlayerService } from "../services/playerService.js";
import type { CreatePlayerDTO } from "../validations/player.validation.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { AppError } from "../utils/AppError.js";

export class PlayerController {
    static createPlayer = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const playerData: CreatePlayerDTO = req.body;
        const newPlayer = await PlayerService.createPlayer(playerData);
        res.status(201).json(newPlayer);
    });

    static getPlayerByTeam = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const teamId: string = req.params.teamId as string;
        const players = await PlayerService.getPlayerByTeam(teamId);
        res.status(200).json(players);
    });

    static getPlayersByName = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const playerName: string = req.params.name as string;
        const players = await PlayerService.getPlayersByName(playerName);
        res.status(200).json(players);
    });

    static getPlayerByNumber = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const teamId: string = req.params.teamId as string;
        const playerNumber: number = Number(req.params.playerNumber as string);
        if (isNaN(playerNumber)) {
            throw new AppError("Invalid player number", 400);
        }
        const players = await PlayerService.getPlayerByNumber(teamId, playerNumber);
        res.status(200).json(players);
    });

    static getAllPlayersSpain = wrapAsync(async (_req: Request, res: Response): Promise<void> => {
        const players = await PlayerService.getAllSpainPlayers();
        res.status(200).json(players);
    });

    static getTop3ExpensivePlayers = wrapAsync(async (_req: Request, res: Response): Promise<void> => {
        const players = await PlayerService.getTop3MostExpensive();
        res.status(200).json(players);
    });

    static getTopScorersPlayers = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const nationality: string = req.params.nationality as string;
        const topPlayers = await PlayerService.getTopScorersByNationality(nationality);
        res.status(200).json(topPlayers);
    });

    static getMostEfficientPlayers = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const minMatches = req.query.minMatches ? Number(req.query.minMatches) : 10;
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const players = await PlayerService.getMostEfficientPlayers(minMatches, limit);
        res.status(200).json(players);
    });

    static transferPlayer = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const playerId: string = req.params.playerId as string;
        const newTeamId: string = req.body.newTeamId;
        const updatedPlayer = await PlayerService.transferPlayer(playerId, newTeamId);
        res.status(200).json(updatedPlayer);
    });

    static deletePlayer = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const playerId: string = req.params.playerId as string;
        await PlayerService.deletePlayer(playerId);
        res.sendStatus(204);
    });
}
