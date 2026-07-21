import { Router } from "express";
import { TeamController } from "../controllers/team.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createTeamSchema, teamIdParamSchema } from "../validations/team.validation.js";
import { createGameSchema } from "../validations/game.validation.js";

class TeamRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.initRoutes();
    }
    private initRoutes = (): void => {
        this.router.post("/", validateRequest(createTeamSchema, "body"), TeamController.createTeam);
        this.router.post(
            "/:teamId/players",
            validateRequest(teamIdParamSchema, "params"),
            TeamController.addPlayerToTeam
        );
        this.router.post(
            "/:teamId/games",
            validateRequest(teamIdParamSchema, "params"),
            validateRequest(createGameSchema, "body"),
            TeamController.addGame
        );
        this.router.get("/top-brazilian-players", TeamController.getTopTeamsWithBrazilianPlayers);
        this.router.get(
            "/performance/:teamId",
            validateRequest(teamIdParamSchema, "params"),
            TeamController.getAverageTeamPerformance
        );
        this.router.get("/countries/representation",TeamController.getCountryRepresentation)
        this.router.delete("/:teamId", validateRequest(teamIdParamSchema, "params"), TeamController.deleteTeam);
    };
}

export default new TeamRouter().router;
