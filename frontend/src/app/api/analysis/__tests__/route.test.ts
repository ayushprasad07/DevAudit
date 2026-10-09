import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => {
  const create = vi.fn();

  class MockJobManager {
    create = create;
  }

  return {
    create,
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

import { POST } from "../route";

describe("POST /api/analysis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
  it("creates a queued analysis job", async () => {
    mocks.create.mockResolvedValueOnce({
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

    expect(mocks.create).toHaveBeenCalledWith("job_test_123");
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

    expect(mocks.create).not.toHaveBeenCalled();
  });
});