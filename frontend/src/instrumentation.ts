import { ensureMongoIndexes } from "./lib/mongodbIndexes";

export async function register(){
    if (process.env.NEXT_RUNTIME === "nodejs"){
        await ensureMongoIndexes();
    }
}