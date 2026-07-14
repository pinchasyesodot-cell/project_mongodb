import { Router } from "express";
import { PlayerController } from "../controllers/player.controller.js";

class PlayerRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.initRoutes();
    }
    private initRoutes = (): void => {
        this.router.post("/", PlayerController.createPlayer);
        this.router.get("/team/:teamId", PlayerController.getPlayerByTeam);
        this.router.get("/search", PlayerController.getPlayersByName);
        this.router.get("/number/:teamId/", PlayerController.getPlayerByNumber);
        this.router.put("/:playerId/transfer", PlayerController.transferPlayer);
        this.router.delete("/:playerId", PlayerController.deletePlayer);
    };
}

export default new PlayerRouter().router;
