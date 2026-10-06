import { describe, expect, it } from "vitest";

import { InMemoryJobStore } from "../InMemoryJobStore";

describe("InMemoryJobStore", () => {
  it("stores and retrieves a job", async () => {
    const store = new InMemoryJobStore();

    const job = {
      jobId: "job_123",
      status: "queued" as const,
      createdAt: new Date().toISOString(),
    };

    await store.create(job);

    const stored = await store.get("job_123");

    expect(stored).toEqual(job);
  });

  it("returns undefined for an unknown job", async () => {
    const store = new InMemoryJobStore();

    const result = await store.get("does_not_exist");

    expect(result).toBeUndefined();
  });

  it("updates an existing job", async () => {
    const store = new InMemoryJobStore();

    const job = {
      jobId: "job_123",
      status: "queued" as const,
      createdAt: new Date().toISOString(),
    };

    await store.create(job);

    const updatedJob = {
      ...job,
      status: "running" as const,
      startedAt: new Date().toISOString(),
    };

    await store.update(updatedJob);

    const stored = await store.get("job_123");

    expect(stored).toEqual(updatedJob);
  });
});