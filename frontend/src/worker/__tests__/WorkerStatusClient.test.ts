
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkerStatusClient } from "../WorkerStatusClient";

describe("WorkerStatusClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends an authenticated running update", async () => {
    const client = new WorkerStatusClient(
      "http://127.0.0.1:3000/",
      "test-secret",
    );

    await client.updateStatus("job_123", { status: "running" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3000/api/internal/worker/jobs/job_123/status",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-secret",
        },
        body: JSON.stringify({ status: "running" }),
      }),
    );
  });

  it("sends failure details", async () => {
    const client = new WorkerStatusClient(
      "http://127.0.0.1:3000",
      "test-secret",
    );

    const update = {
      status: "failed" as const,
      error: {
        code: "TOOL_FAILED",
        message: "Analysis failed",
      },
    };

    await client.updateStatus("job_123", update);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(update);
  });

  it("throws when Next.js rejects the update", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 409 });

    const client = new WorkerStatusClient(
      "http://127.0.0.1:3000",
      "test-secret",
    );

    await expect(
      client.updateStatus("job_123", { status: "completed" }),
    ).rejects.toThrow("HTTP status 409");
  });

  it("requires a Next.js URL and shared secret", () => {
    expect(() => new WorkerStatusClient("", "secret")).toThrow(
      "Next.js application URL is required",
    );

    expect(() => new WorkerStatusClient("http://localhost:3000", "")).toThrow(
      "Worker authentication secret is required",
    );
  });
});
