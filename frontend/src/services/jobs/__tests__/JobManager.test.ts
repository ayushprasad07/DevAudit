import { describe, expect, it } from "vitest";

import { JobManager } from "../JobManager";
import { InMemoryJobStore } from "../InMemoryJobStore";

describe("JobManager", () => {
  const createManager = () =>
    new JobManager(new InMemoryJobStore());

  it("creates a queued job", async () => {
    const manager = createManager();

    const job = await manager.create("job_123");

    expect(job).toMatchObject({
      jobId: "job_123",
      status: "queued",
    });
    expect(job.createdAt).toBeDefined();
  });

  it("retrieves an existing job", async () => {
    const manager = createManager();

    await manager.create("job_123");

    const job = await manager.get("job_123");

    expect(job).toBeDefined();
    expect(job?.jobId).toBe("job_123");
  });

  it("returns undefined for an unknown job", async () => {
    const manager = createManager();

    await expect(manager.get("does_not_exist")).resolves.toBeUndefined();
  });

  it("starts a queued job", async () => {
    const manager = createManager();

    await manager.create("job_123");

    const job = await manager.start("job_123");

    expect(job.status).toBe("running");
    expect(job.startedAt).toBeDefined();
  });

  it("completes a running job", async () => {
    const manager = createManager();

    await manager.create("job_123");
    await manager.start("job_123");

    const job = await manager.complete("job_123");

    expect(job.status).toBe("completed");
    expect(job.completedAt).toBeDefined();
  });

  it("fails a running job", async () => {
    const manager = createManager();

    await manager.create("job_123");
    await manager.start("job_123");

    const job = await manager.fail(
      "job_123",
      "TIMEOUT",
      "Dependency resolution timed out"
    );

    expect(job.status).toBe("failed");
    expect(job.completedAt).toBeDefined();
    expect(job.error).toEqual({
      code: "TIMEOUT",
      message: "Dependency resolution timed out",
    });
  });

  it("does not complete a queued job", async () => {
    const manager = createManager();

    await manager.create("job_123");

    await expect(manager.complete("job_123")).rejects.toThrow(
      "Cannot complete job job_123 from status queued"
    );
  });

  it("does not start a completed job", async () => {
    const manager = createManager();

    await manager.create("job_123");
    await manager.start("job_123");
    await manager.complete("job_123");

    await expect(manager.start("job_123")).rejects.toThrow(
      "Cannot start job job_123 from status completed"
    );
  });

  it("does not fail a completed job", async () => {
    const manager = createManager();

    await manager.create("job_123");
    await manager.start("job_123");
    await manager.complete("job_123");

    await expect(
      manager.fail(
        "job_123",
        "TIMEOUT",
        "Dependency resolution timed out"
      )
    ).rejects.toThrow(
      "Cannot fail job job_123 from status completed"
    );
  });

  it("throws when the job does not exist", async () => {
    const manager = createManager();

    await expect(manager.start("unknown_job")).rejects.toThrow(
      "Job not found: unknown_job"
    );
  });
});