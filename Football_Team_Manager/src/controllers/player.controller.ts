import type { Request, Response } from "express";
import type { Player } from "../interfaces/Player.js";
import { PlayerService } from "../services/playerService.js";

export class PlayerController {
    static createPlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerData: Player = req.body;
            const newPlayer = await PlayerService.createPlayer(playerData);
            res.status(201).json(newPlayer);
        } catch (error) {
            res.status(500).json({ error: `Error creating player: ${(error as Error).message}` });
        }
    };
    static getPlayerByTeam = async (req: Request, res: Response): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const players = await PlayerService.getPlayerByTeam(teamId);
            res.status(200).json(players);
        } catch (error) {
            res.status(500).json({ error: `Error fetching players by team: ${(error as Error).message}` });
        }
    };
    static getPlayersByName = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerName: string = req.body.name;
            const players = await PlayerService.getPlayersByName(playerName);
            res.status(200).json(players);
        } catch (error) {
            res.status(500).json({ error: `Error fetching players by name: ${(error as Error).message}` });
        }
    };
    static getPlayerByNumber = async (req: Request, res: Response): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const playerNumber: number = req.body.number;
            const players = await PlayerService.getPlayerByNumber(teamId, playerNumber);
            res.status(200).json(players);
        } catch (error) {
            res.status(500).json({ error: `Error fetching player by number: ${(error as Error).message}` });
        }
    };
    static transferPlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerId: string = req.params.playerId as string;
            const newTeamId: string = req.body.newTeamId;
            const updatedPlayer = await PlayerService.transferPlayer(playerId, newTeamId);
            res.status(200).json(updatedPlayer);
        } catch (error) {
            res.status(500).json({ error: `Error transferring player: ${(error as Error).message}` });
        }
    };
    static deletePlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerId: string = req.params.playerId as string;
            await PlayerService.deletePlayer(playerId);
            res.status(200).json({ message: "Player deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: `Error deleting player: ${(error as Error).message}` });
        }
    };
}
