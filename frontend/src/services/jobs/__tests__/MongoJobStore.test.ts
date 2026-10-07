import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertOne = vi.fn();
  const findOne = vi.fn();
  const replaceOne = vi.fn();

  const collection = {
    insertOne,
    findOne,
    replaceOne,
  };

  const getDb = vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue(collection),
  });

  return {
    insertOne,
    findOne,
    replaceOne,
    collection,
    getDb,
  };
});

vi.mock("@/lib/mongodb", () => ({
  getDb: mocks.getDb,
}));

import { MongoJobStore } from "../MongoJobStore";

describe("MongoJobStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const job = {
    jobId: "job_123",
    status: "queued" as const,
    createdAt: "2026-10-07T06:00:00.000Z",
  };

  it("creates a job", async () => {
    const store = new MongoJobStore();

    await store.create(job);

    expect(mocks.getDb).toHaveBeenCalledTimes(1);
    expect(mocks.insertOne).toHaveBeenCalledWith(job);
  });

  it("gets a job by jobId", async () => {
    mocks.findOne.mockResolvedValueOnce(job);

    const store = new MongoJobStore();

    const result = await store.get("job_123");

    expect(mocks.getDb).toHaveBeenCalledTimes(1);

    expect(mocks.findOne).toHaveBeenCalledWith(
      { jobId: "job_123" },
      {
        projection: {
          _id: 0,
        },
      }
    );

    expect(result).toEqual(job);
  });

  it("returns undefined when a job does not exist", async () => {
    mocks.findOne.mockResolvedValueOnce(null);

    const store = new MongoJobStore();

    const result = await store.get("does_not_exist");

    expect(result).toBeUndefined();
  });

  it("updates a job", async () => {
    const updatedJob = {
      ...job,
      status: "running" as const,
      startedAt: "2026-10-07T06:01:00.000Z",
    };

    const store = new MongoJobStore();

    await store.update(updatedJob);

    expect(mocks.getDb).toHaveBeenCalledTimes(1);

    expect(mocks.replaceOne).toHaveBeenCalledWith(
      { jobId: "job_123" },
      updatedJob
    );
  });
});