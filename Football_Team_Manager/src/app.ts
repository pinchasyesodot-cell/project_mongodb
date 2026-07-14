import express, { type Application } from "express";
import { PORT } from "./config/env.js";
import database from "./config/db.js";
import  playerRouter  from "./routers/playerRouter.js";
import teamRouter from "./routers/teamRouter.js";

class Server {
    public app: Application;
    public port: number;
    constructor() {
        this.app = express();
        this.port = PORT;
        this.initMiddlewares();
    }
    private initMiddlewares(): void {
        this.app.use(express.json());
        this.app.use("/api/players", playerRouter);
    }

    public async start(): Promise<void> {
        try {
            await database.connect();
            this.app.listen(this.port, "0.0.0.0", () => {
                console.log(`Server is running on http://localhost:${this.port}`);
            });
        } catch (error) {
            console.error("Failed to start the server:", error);
            process.exit(1);
        }
    }
}
const server = new Server();
server.start();
