import type { NextFunction, Request, Response } from "express";
import { PlayerService } from "../services/playerService.js";
import type { CreatePlayerDTO } from "../validations/player.validation.js";

export class PlayerController {
    static createPlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const playerData: CreatePlayerDTO = req.body;
            const newPlayer = await PlayerService.createPlayer(playerData);
            res.status(201).json(newPlayer);
        } catch (error) {
            next(error);
        }
    };

    static getPlayerByTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const players = await PlayerService.getPlayerByTeam(teamId);
            res.status(200).json(players);
        } catch (error) {
            next(error);
        }
    };

    static getPlayersByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const playerName: string = req.params.name as string;
            const players = await PlayerService.getPlayersByName(playerName);
            res.status(200).json(players);
        } catch (error) {
            next(error);
        }
    };

    static getPlayerByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const playerNumber: number = Number(req.params.playerNumber as string);
            if (isNaN(playerNumber)) {
                throw new Error("Invalid player number");
            }
            const players = await PlayerService.getPlayerByNumber(teamId, playerNumber);
            res.status(200).json(players);
        } catch (error) {
            next(error);
        }
    };

    static getAllPlayersSpain = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const players = await PlayerService.getAllSpainPlayers();
            res.status(200).json(players);
        } catch (error) {
            next(error);
        }
    };

    static getTop3ExpensivePlayers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const players = await PlayerService.getTop3MostExpensive();
            res.status(200).json(players);
        } catch (error) {
            next(error);
        }
    };

    static getTopScorersPlayers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const natioality: string = req.params.natioality as string;
            const topPlayers = PlayerService.getTopScorersByNationality(natioality);
            res.status(200).json(topPlayers);
        } catch (error) {
            next(error);
        }
    };

    static transferPlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const playerId: string = req.params.playerId as string;
            const newTeamId: string = req.body.newTeamId;
            const updatedPlayer = await PlayerService.transferPlayer(playerId, newTeamId);
            res.status(200).json(updatedPlayer);
        } catch (error) {
            next(error);
        }
    };

    static deletePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const playerId: string = req.params.playerId as string;
            await PlayerService.deletePlayer(playerId);
            res.status(200).json({ message: "Player deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
