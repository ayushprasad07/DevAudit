
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  complete: vi.fn(),
  fail: vi.fn(),
}));

vi.mock("@/services/jobs/JobManager", () => ({
  JobManager: class {
    start = mocks.start;
    complete = mocks.complete;
    fail = mocks.fail;
  },
}));

vi.mock("@/services/jobs/MongoJobStore", () => ({
  MongoJobStore: vi.fn(),
}));

import { POST } from "./route";

const SECRET = "test-worker-secret";
const JOB_ID = "job_test_123";

function makeRequest(
  body: unknown,
  authorization = `Bearer ${SECRET}`,
): Request {
  return new Request(`http://localhost/api/internal/worker/jobs/${JOB_ID}/status`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function makeContext() {
  return {
    params: Promise.resolve({ jobId: JOB_ID }),
  };
}

describe("Worker job status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("WORKER_SHARED_SECRET", SECRET);

    mocks.start.mockResolvedValue({});
    mocks.complete.mockResolvedValue({});
    mocks.fail.mockResolvedValue({});
  });

  it("rejects missing authentication", async () => {
    const request = makeRequest(
      { status: "running" },
      "",
    );

    const response = await POST(request, makeContext());

    expect(response.status).toBe(401);
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it("rejects an incorrect secret", async () => {
    const request = makeRequest(
      { status: "running" },
      "Bearer wrong-secret",
    );

    const response = await POST(request, makeContext());

    expect(response.status).toBe(401);
  });

  it("rejects invalid JSON", async () => {
    const request = new Request(
      `http://localhost/api/internal/worker/jobs/${JOB_ID}/status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SECRET}`,
          "Content-Type": "application/json",
        },
        body: "{invalid-json",
      },
    );

    const response = await POST(request, makeContext());

    expect(response.status).toBe(400);
  });

  it("rejects an invalid status payload", async () => {
    const response = await POST(
      makeRequest({ status: "unknown" }),
      makeContext(),
    );

    expect(response.status).toBe(400);
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.fail).not.toHaveBeenCalled();
  });

  it("starts a job", async () => {
    const response = await POST(
      makeRequest({ status: "running" }),
      makeContext(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      status: "updated",
      jobId: JOB_ID,
    });
    expect(mocks.start).toHaveBeenCalledWith(JOB_ID);
  });

  it("completes a job", async () => {
    const response = await POST(
      makeRequest({ status: "completed" }),
      makeContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.complete).toHaveBeenCalledWith(JOB_ID);
  });

  it("fails a job with error details", async () => {
    const response = await POST(
      makeRequest({
        status: "failed",
        error: {
          code: "TOOL_FAILED",
          message: "Dependency analysis failed",
        },
      }),
      makeContext(),
    );

    expect(response.status).toBe(200);
    expect(mocks.fail).toHaveBeenCalledWith(
      JOB_ID,
      "TOOL_FAILED",
      "Dependency analysis failed",
    );
  });

  it("rejects failure updates without error details", async () => {
    const response = await POST(
      makeRequest({ status: "failed", error: { code: "", message: "" } }),
      makeContext(),
    );

    expect(response.status).toBe(400);
    expect(mocks.fail).not.toHaveBeenCalled();
  });

  it("returns 409 when a state transition fails", async () => {
    mocks.start.mockRejectedValueOnce(
      new Error("Cannot start job from status completed"),
    );

    const response = await POST(
      makeRequest({ status: "running" }),
      makeContext(),
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      success: false,
      status: "error",
    });
  });
});
