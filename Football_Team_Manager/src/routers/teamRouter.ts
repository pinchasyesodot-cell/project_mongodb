import { Router } from "express";
import { TeamController } from "../controllers/team.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createTeamSchema, teamIdParamSchema } from "../validations/team.validation.js";

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
        this.router.get("/top-brazilian-players", TeamController.getTopTeamsWithBrazilianPlayers);
        this.router.delete("/:teamId", validateRequest(teamIdParamSchema, "params"), TeamController.deleteTeam);
    };
}

export default new TeamRouter().router;
