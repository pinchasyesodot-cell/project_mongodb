import type { Request, Response } from "express";
import type { Team } from "../interfaces/Team.js";
import { TeamService } from "../services/teamService.js";

export class TeamController {
    static createTeam = async (req: Request, res: Response): Promise<void> => {
        try {
            const teamData: Team = req.body;
            const newTeam = await TeamService.createTeam(teamData);
            res.status(201).json(newTeam);
        } catch (error) {
            res.status(500).json({ error: `Error creating team: ${(error as Error).message}` });
        }
    };
    static addPlayerToTeam = async (req: Request, res: Response): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            const playerId: string = req.body.playerId;
            const updatedTeam = await TeamService.addPlayerToTeam(teamId, playerId);
            res.status(200).json(updatedTeam);
        } catch (error) {
            res.status(500).json({ error: `Error adding player to team: ${(error as Error).message}` });
        }
    };
    static getTopTeamsWithBrazilianPlayers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const topTeams = await TeamService.getTopTeamsWithBrazilianPlayers();
            res.status(200).json(topTeams);
        } catch (error) {
            res.status(500).json({
                error: `Error fetching top teams with Brazilian players: ${(error as Error).message}`,
            });
        }
    };
    static deleteTeam = async (req: Request, res: Response): Promise<void> => {
        try {
            const teamId: string = req.params.teamId as string;
            await TeamService.deleteTeam(teamId);
            res.status(200).json({ message: "Team deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: `Error deleting team: ${(error as Error).message}` });
        }
    };
}
