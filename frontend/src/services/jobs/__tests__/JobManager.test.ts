import { describe, expect, it } from "vitest";

import { JobManager } from "../JobManager";

describe("JobManager", () => {
  it("creates a queued job", () => {
    const manager = new JobManager();

    const job = manager.create("job_123");

    expect(job.jobId).toBe("job_123");
    expect(job.status).toBe("queued");
    expect(job.createdAt).toBeDefined();
  });

  it("retrieves an existing job", () => {
    const manager = new JobManager();

    manager.create("job_123");

    const job = manager.get("job_123");

    expect(job).toBeDefined();
    expect(job?.jobId).toBe("job_123");
  });

  it("returns undefined for an unknown job", () => {
    const manager = new JobManager();

    expect(manager.get("does_not_exist")).toBeUndefined();
  });

  it("starts a queued job", () => {
  const manager = new JobManager();

  manager.create("job_123");

  const job = manager.start("job_123");

  expect(job.status).toBe("running");
  expect(job.startedAt).toBeDefined();
});

it("completes a running job", () => {
  const manager = new JobManager();

  manager.create("job_123");
  manager.start("job_123");

  const job = manager.complete("job_123");

  expect(job.status).toBe("completed");
  expect(job.completedAt).toBeDefined();
});

it("fails a running job", () => {
  const manager = new JobManager();

  manager.create("job_123");
  manager.start("job_123");

  const job = manager.fail(
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
it("does not complete a queued job", () => {
  const manager = new JobManager();

  manager.create("job_123");

  expect(() => manager.complete("job_123")).toThrow(
    "Cannot complete job job_123 from status queued"
  );
});

it("does not start a completed job", () => {
  const manager = new JobManager();

  manager.create("job_123");
  manager.start("job_123");
  manager.complete("job_123");

  expect(() => manager.start("job_123")).toThrow(
    "Cannot start job job_123 from status completed"
  );
});

it("does not fail a completed job", () => {
  const manager = new JobManager();

  manager.create("job_123");
  manager.start("job_123");
  manager.complete("job_123");

  expect(() =>
    manager.fail(
      "job_123",
      "TIMEOUT",
      "Dependency resolution timed out"
    )
  ).toThrow(
    "Cannot fail job job_123 from status completed"
  );
});

it("throws when the job does not exist", () => {
  const manager = new JobManager();

  expect(() => manager.start("unknown_job")).toThrow(
    "Job not found: unknown_job"
  );
});
});