import type { NextFunction, Request, Response } from "express";
import { TeamService } from "../services/teamService.js";
import type { CreateTeamDTO } from "../validations/team.validation.js";

export class TeamController {
    static createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamData: CreateTeamDTO = req.body;
            const newTeam = await TeamService.createTeam(teamData);
            res.status(201).json(newTeam);
        } catch (error) {
            next(error);
        }
    };
    static addPlayerToTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const playerId: string = req.body.playerId;
            const updatedTeam = await TeamService.addPlayerToTeam(teamId, playerId);
            res.status(200).json(updatedTeam);
        } catch (error) {
            next(error);
        }
    };
    static getTopTeamsWithBrazilianPlayers = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const topTeams = await TeamService.getTopTeamsWithBrazilianPlayers();
            res.status(200).json(topTeams);
        } catch (error) {
            next(error);
        }
    };
    static deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            await TeamService.deleteTeam(teamId);
            res.status(200).json({ message: "Team deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
