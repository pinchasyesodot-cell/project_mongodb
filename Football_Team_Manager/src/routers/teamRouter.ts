import { Router } from "express";
import { TeamController } from "../controller/tean.controller.js";

class TeamRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.initRoutes();
    }
    private initRoutes = (): void => {
        this.router.post("/", TeamController.createTeam);
        this.router.post("/:teamId/players", TeamController.addPlayerToTeam);
        this.router.get("/top-brazilian-players", TeamController.getTopTeamsWithBrazilianPlayers);
        this.router.delete("/:teamId", TeamController.deleteTeam);
    };
}

export default new TeamRouter().router;
