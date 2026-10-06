import { describe, expect, it } from "vitest";

import {
  JobSchema,
  JobStatusSchema,
} from "../jobs";

describe("JobStatusSchema", () => {
  it("accepts valid job statuses", () => {
    expect(JobStatusSchema.safeParse("queued").success).toBe(true);
    expect(JobStatusSchema.safeParse("running").success).toBe(true);
    expect(JobStatusSchema.safeParse("completed").success).toBe(true);
    expect(JobStatusSchema.safeParse("failed").success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(JobStatusSchema.safeParse("processing").success).toBe(false);
  });
});

describe("JobSchema", () => {
  it("accepts a queued job", () => {
    const result = JobSchema.safeParse({
      jobId: "job_123",
      status: "queued",
      createdAt: "2026-10-05T17:30:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a running job", () => {
    const result = JobSchema.safeParse({
      jobId: "job_123",
      status: "running",
      createdAt: "2026-10-05T17:30:00.000Z",
      startedAt: "2026-10-05T17:31:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a completed job", () => {
    const result = JobSchema.safeParse({
      jobId: "job_123",
      status: "completed",
      createdAt: "2026-10-05T17:30:00.000Z",
      startedAt: "2026-10-05T17:31:00.000Z",
      completedAt: "2026-10-05T17:32:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a failed job with an error", () => {
    const result = JobSchema.safeParse({
      jobId: "job_123",
      status: "failed",
      createdAt: "2026-10-05T17:30:00.000Z",
      startedAt: "2026-10-05T17:31:00.000Z",
      completedAt: "2026-10-05T17:32:00.000Z",
      error: {
        code: "TIMEOUT",
        message: "Dependency resolution timed out",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects a job without a jobId", () => {
    const result = JobSchema.safeParse({
      status: "queued",
      createdAt: "2026-10-05T17:30:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});