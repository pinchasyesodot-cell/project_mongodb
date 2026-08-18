import type { NextFunction, Request, Response } from "express";
import { TeamService } from "../services/teamService.js";
import type { CreateTeamDTO } from "../validations/team.validation.js";
import type { createGameDTO } from "../validations/game.validation.js";
import { wrapAsync } from "../utils/wrapAsync.js";

export class TeamController {
    static createTeam = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const teamData: CreateTeamDTO = req.body;
        const newTeam = await TeamService.createTeam(teamData);
        res.status(201).json(newTeam);
    });

    static addPlayerToTeam = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const teamId: string = req.params.teamId as string;
        const playerId: string = req.body.playerId;
        const updatedTeam = await TeamService.addPlayerToTeam(teamId, playerId);
        res.status(200).json(updatedTeam);
    });

    static addGame = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const gameData: createGameDTO = req.body;
        const teamId: string = req.params.teamId as string;
        const updatedPlayer = await TeamService.addGame(teamId, gameData);
        res.status(200).json(updatedPlayer);
    });

    static getTopTeamsWithBrazilianPlayers = wrapAsync(async (_req: Request, res: Response): Promise<void> => {
        const topTeams = await TeamService.getTopTeamsWithBrazilianPlayers();
        res.status(200).json(topTeams);
    });

    static getAverageTeamPerformance = wrapAsync(async (req: Request, res: Response) => {
        const teamId: string = req.params.teamId as string;
        const averageTeamPerformance = await TeamService.getAverageTeamPerformance(teamId);
        res.status(200).json(averageTeamPerformance);
    });

    static getCountryRepresentation = wrapAsync(async (_req: Request, res: Response) => {
        const teams = await TeamService.getCountryRepresentation();
        res.status(200).json(teams);
    });

    static deleteTeam = wrapAsync(async (req: Request, res: Response): Promise<void> => {
        const teamId: string = req.params.teamId as string;
        await TeamService.deleteTeam(teamId);
        res.sendStatus(204)
    });
}
