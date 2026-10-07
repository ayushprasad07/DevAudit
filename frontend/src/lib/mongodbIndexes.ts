import { getDb } from "./mongodb";

export async function ensureMongoIndexes(): Promise<void> {
  const db = await getDb();

  await db.collection("jobs").createIndex(
    { jobId: 1 },
    { unique: true }
  );
}