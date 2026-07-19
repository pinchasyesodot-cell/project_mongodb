import { Router } from "express";
import { PlayerController } from "../controllers/player.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createPlayerSchema,
    playerIdParamSchema,
    playerNameParamSchema,
    teamAndPlayerNumberSchema,
} from "../validations/player.validation.js";
import { teamIdParamSchema } from "../validations/team.validation.js";

class PlayerRouter {
    public router: Router;
    constructor() {
        this.router = Router();
        this.initRoutes();
    }
    private initRoutes = (): void => {
        this.router.post("/", validateRequest(createPlayerSchema, "body"), PlayerController.createPlayer);
        this.router.get(
            "/team/:teamId",
            validateRequest(teamIdParamSchema, "params"),
            PlayerController.getPlayerByTeam
        );
        this.router.get(
            "/search/:name",
            validateRequest(playerNameParamSchema, "params"),
            PlayerController.getPlayersByName
        );
        this.router.get(
            "/number/:teamId/:playerNumber",
            validateRequest(teamAndPlayerNumberSchema, "params"),
            PlayerController.getPlayerByNumber
        );
        this.router.put(
            "/:playerId/transfer",
            validateRequest(playerIdParamSchema, "params"),
            PlayerController.transferPlayer
        );
        this.router.delete("/:playerId", validateRequest(playerIdParamSchema, "params"), PlayerController.deletePlayer);
    };
}

export default new PlayerRouter().router;
