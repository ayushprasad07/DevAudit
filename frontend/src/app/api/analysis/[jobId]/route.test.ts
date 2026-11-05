
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => {
  const get = vi.fn();

  class MockJobManager {
    get = get;
  }

  return {
    get,
    MockJobManager,
  };
});

vi.mock("@/services/jobs/JobManager", () => ({
  JobManager: mocks.MockJobManager,
}));

vi.mock("@/services/jobs/MongoJobStore", () => ({
  MongoJobStore: vi.fn(),
}));

import { GET } from "./route";

const JOB_ID = "job_test_123";

function makeContext(jobId = JOB_ID) {
  return {
    params: Promise.resolve({ jobId }),
  };
}

describe("GET /api/analysis/[jobId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns an existing queued job", async () => {
    const mockJob = {
      jobId: JOB_ID,
      status: "queued",
      createdAt: "2026-10-08T05:00:00.000Z",
    };

    mocks.get.mockResolvedValueOnce(mockJob);

    const response = await GET(
      new Request(`http://localhost:3000/api/analysis/${JOB_ID}`),
      makeContext(),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      job: mockJob,
    });

    expect(mocks.get).toHaveBeenCalledWith(JOB_ID);
  });

  it("returns a completed job with its analysis result", async () => {
    const mockJob = {
      jobId: JOB_ID,
      status: "completed",
      createdAt: "2026-10-08T05:00:00.000Z",
      startedAt: "2026-10-08T05:01:00.000Z",
      completedAt: "2026-10-08T05:02:00.000Z",
      result: {
        ecosystem: "javascript",
        packageManager: "npm",
        dependencies: [
          {
            name: "express",
            version: "^4.18.0",
            ecosystem: "javascript",
            direct: true,
          },
        ],
      },
    };

    mocks.get.mockResolvedValueOnce(mockJob);

    const response = await GET(
      new Request(`http://localhost:3000/api/analysis/${JOB_ID}`),
      makeContext(),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.job).toEqual(mockJob);
    expect(body.job.result.dependencies).toHaveLength(1);
    expect(body.job.result.dependencies[0].name).toBe("express");

    expect(mocks.get).toHaveBeenCalledWith(JOB_ID);
  });

  it("returns 404 when the job does not exist", async () => {
    mocks.get.mockResolvedValueOnce(undefined);

    const response = await GET(
      new Request(`http://localhost:3000/api/analysis/unknown_job`),
      makeContext("unknown_job"),
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      success: false,
      message: "Job not found",
    });
  });

  it("returns 500 when job retrieval fails", async () => {
    mocks.get.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await GET(
      new Request(`http://localhost:3000/api/analysis/${JOB_ID}`),
      makeContext(),
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "Unable to retrieve analysis job",
    });
  });

  it("returns 400 when the job ID is empty", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/analysis/ "),
      makeContext(" "),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      message: "Job ID is required",
    });

    expect(mocks.get).not.toHaveBeenCalled();
  });
});
