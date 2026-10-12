import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => {
  const create = vi.fn();
  const createAnalysisJob = vi.fn();

  class MockJobManager {
    create = create;
  }

  return {
    create,
    createAnalysisJob,
    MockJobManager,
  };
});

vi.mock("@/services/jobs/JobManager", () => ({
  JobManager: mocks.MockJobManager,
}));

vi.mock("@/services/jobs/MongoJobStore", () => ({
  MongoJobStore: vi.fn(),
}));

vi.mock("@/services/jobs/jobId", () => ({
  generateJobId: vi.fn(() => "job_test_123"),
}));

vi.mock("@/services/analysis/AnalysisJobService", () => ({
  AnalysisJobService: class {
    createAnalysisJob = mocks.createAnalysisJob;
  },
}));

vi.mock("@/services/worker/HttpWorkerDispatcher", () => ({
  HttpWorkerDispatcher: vi.fn(),
}));

import { POST } from "../route";

describe("POST /api/analysis", () => {
    beforeEach(() => {
  vi.clearAllMocks();

  vi.stubEnv("WORKER_URL", "http://localhost:4000");
  vi.stubEnv("WORKER_SHARED_SECRET", "a4d3b6d6c0f5e1a08b82a867a471eeef394955b284b47733ea4758fa7fb5e3d3");
});

afterEach(() => {
  vi.unstubAllEnvs();
});
  it("creates a queued analysis job", async () => {
    mocks.createAnalysisJob.mockResolvedValueOnce({
  jobId: "job_test_123",
  status: "queued",
  createdAt: "2026-10-08T05:00:00.000Z",
});

    const request = new Request("http://localhost:3000/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repository: {
          url: "https://github.com/example/demo",
          commit: "a1b2c3d4e5f6789012345678901234567890abcd",
        },
        ecosystem: "javascript",
        timeoutMs: 120_000,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(202);

    expect(body).toEqual({
      jobId: "job_test_123",
      status: "queued",
    });

    expect(mocks.createAnalysisJob).toHaveBeenCalledOnce();
  });

  it("rejects an invalid analysis request", async () => {
    const request = new Request("http://localhost/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repository: {
          url: "not-a-url",
          commit: "invalid",
        },
        ecosystem: "javascript",
        timeoutMs: 120_000,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);

    expect(body.status).toBe("error");
    expect(body.message).toBe("Invalid analysis request");

    expect(mocks.createAnalysisJob).not.toHaveBeenCalled();
  });
});