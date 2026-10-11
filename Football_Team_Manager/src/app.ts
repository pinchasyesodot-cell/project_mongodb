import express, { type Application } from "express";
import database from "./config/db.js";
import { PORT } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import playerRouter from "./routers/playerRouter.js";
import teamRouter from "./routers/teamRouter.js";
import logger from "./utils/logger.js";

class Server {
    public app: Application;
    constructor() {
        this.app = express();
        this.initMiddlewares();
    }
    private initMiddlewares(): void {
        this.app.use(express.json());
        this.app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
            logger.info(`Incoming Request: method: ${req.method}, url: ${req.url}, IP: ${req.ip}`);
            next();
        });
        this.app.use("/api/players", playerRouter);
        this.app.use("/api/teams", teamRouter);
        this.app.use(errorHandler);
    }

    public start = async (): Promise<void> => {
        try {
            await database.connect();
            this.app.listen(PORT, "0.0.0.0", () => {
                logger.info(`Server is running on http://localhost:${PORT}`);
            });
        } catch (error) {
            logger.error("Failed to start the server:", error);
            process.exit(1);
        }
    };
}
const server = new Server();
server.start();
