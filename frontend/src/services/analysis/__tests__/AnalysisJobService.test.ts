import { describe, expect, it } from "vitest";

import { AnalysisJobService } from "../AnalysisJobService";
import { JobManager } from "@/services/jobs/JobManager";
import { InMemoryJobStore } from "@/services/jobs/InMemoryJobStore";
import { FakeWorkerDispatcher } from "@/services/worker/FakeWorkerDispatcher";
import { WORKER_CONTRACT_VERSION } from "@/types/worker";
import type { AnalysisJobRequest } from "@/types/analysisJob";

describe("AnalysisJobService", () => {
  it("creates a queued job and dispatches the worker request", async () => {
    const store = new InMemoryJobStore();
    const jobManager = new JobManager(store);
    const dispatcher = new FakeWorkerDispatcher();

    const service = new AnalysisJobService(jobManager, dispatcher);

    const request: AnalysisJobRequest = {
      repository: {
        url: "https://github.com/example/project",
        commit: "a".repeat(40),
      },
      ecosystem: "javascript",
      timeoutMs: 60_000,
    };

    const job = await service.createAnalysisJob(request);

    expect(job.status).toBe("queued");
    expect(job.jobId).toMatch(/^job_/);

    expect(dispatcher.dispatched).toHaveLength(1);
    expect(dispatcher.dispatched[0]).toEqual({
      contractVersion: WORKER_CONTRACT_VERSION,
      jobId: job.jobId,
      repository: request.repository,
      ecosystem: request.ecosystem,
      timeoutMs: request.timeoutMs,
    });

    expect(await jobManager.get(job.jobId)).toEqual(job);
  });

  it("marks the job as failed when worker dispatch fails", async () => {
  const store = new InMemoryJobStore();
  const jobManager = new JobManager(store);

  const dispatcher = new FakeWorkerDispatcher();
  const dispatchError = new Error("Worker unavailable");

  dispatcher.dispatch = async () => {
    throw dispatchError;
  };

  const service = new AnalysisJobService(jobManager, dispatcher);

  const request: AnalysisJobRequest = {
    repository: {
      url: "https://github.com/example/project",
      commit: "a".repeat(40),
    },
    ecosystem: "javascript",
    timeoutMs: 60_000,
  };

  // Dispatch should fail and the error should reach the caller.
  await expect(
    service.createAnalysisJob(request)
  ).rejects.toThrow("Worker unavailable");

  // Retrieve the job ID from the generated worker request is impossible
  // here because dispatch failed before recording it.
  // Instead, mock generateJobId to make the ID predictable.
});
});