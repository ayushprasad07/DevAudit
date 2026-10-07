import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const createIndex = vi.fn();

  const collection = {
    createIndex,
  };

  const getDb = vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue(collection),
  });

  return {
    createIndex,
    collection,
    getDb,
  };
});

vi.mock("../mongodb", () => ({
  getDb: mocks.getDb,
}));

import { ensureMongoIndexes } from "../mongodbIndexes";

describe("ensureMongoIndexes", () => {
  it("creates a unique index on jobId", async () => {
    await ensureMongoIndexes();

    expect(mocks.getDb).toHaveBeenCalledTimes(1);

    expect(mocks.createIndex).toHaveBeenCalledWith(
      { jobId: 1 },
      { unique: true }
    );
  });
});