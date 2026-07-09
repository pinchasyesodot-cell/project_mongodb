import "dotenv/config";
import env from "env-var";

export const PORT = env.get("PORT").required().default("3000").asPortNumber();
export const MONGO_URI = env.get("MONGO_URI").required().asString();