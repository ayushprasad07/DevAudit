
import { describe, expect, it, vi } from "vitest";

import { processJob } from "../processJob";
import type { WorkerAnalysisRequest } from "../../types/worker";

const job: WorkerAnalysisRequest = {
  contractVersion: 1,
  jobId: "job_test_123",
  repository: {
    url: "https://github.com/example/project",
    commit: "a".repeat(40),
  },
  ecosystem: "javascript",
  timeoutMs: 60_000,
};

describe("processJob", () => {
  it("reports running and then completed", async () => {
    const statusClient = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    await processJob(job, statusClient);

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
      1,
      job.jobId,
      { status: "running" },
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
      2,
      job.jobId,
      { status: "completed" },
    );
  });

  it("does not report failure if the running update fails", async () => {
    const statusClient = {
      updateStatus: vi.fn().mockRejectedValue(
        new Error("Next.js is unavailable"),
      ),
    };

    await processJob(job, statusClient);

    expect(statusClient.updateStatus).toHaveBeenCalledTimes(1);
  });

  it("reports failure if completion reporting fails", async () => {
    const statusClient = {
      updateStatus: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Completion update failed"))
        .mockResolvedValueOnce(undefined),
    };

    await processJob(job, statusClient);

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
      3,
      job.jobId,
      {
        status: "failed",
        error: {
          code: "INTERNAL_ERROR",
          message: "Completion update failed",
        },
      },
    );
  });
});
