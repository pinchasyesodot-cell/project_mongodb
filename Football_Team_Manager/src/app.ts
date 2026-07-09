import express, { type Application } from "express";
import { PORT } from "./config/env.js";
import database from "./config/db.js";

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
