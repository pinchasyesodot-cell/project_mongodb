import { connect } from "mongoose";
import { MONGO_URI } from "./env.js";

class Database {
    public async connect(): Promise<void> {
        try {
            await connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log("Connected to MongoDB successfully");
        } catch (error) {
            throw new Error("Failed to connect to MongoDB:", { cause: error });
        }
    }
}

export default new Database();
