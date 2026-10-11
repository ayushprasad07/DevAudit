import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpWorkerDispatcher } from "../HttpWorkerDispatcher";
import type { WorkerAnalysisRequest } from "@/types/worker";

const request: WorkerAnalysisRequest = {
  contractVersion: 1,
  jobId: "job_test_123",
  repository: {
    url: "https://github.com/example/project",
    commit: "a".repeat(40),
  },
  ecosystem: "javascript",
  timeoutMs: 60_000,
};

describe("HttpWorkerDispatcher", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the worker request with authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 202 })
    );

    vi.stubGlobal("fetch", fetchMock);

    const dispatcher = new HttpWorkerDispatcher(
      "http://localhost:4000/",
      "test-secret"
    );

    await dispatcher.dispatch(request);

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe("http://localhost:4000/jobs");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer test-secret",
    });
    expect(JSON.parse(options.body)).toEqual(request);
  });

  it("throws when the worker returns a non-success status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, { status: 503 })
      )
    );

    const dispatcher = new HttpWorkerDispatcher(
      "http://localhost:4000",
      "test-secret"
    );

    await expect(dispatcher.dispatch(request)).rejects.toThrow(
      "Worker dispatch failed with HTTP status 503"
    );
  });

  it("rejects an empty worker URL", () => {
    expect(
      () => new HttpWorkerDispatcher("", "test-secret")
    ).toThrow("Worker URL is required");
  });

  it("rejects an empty worker secret", () => {
    expect(
      () => new HttpWorkerDispatcher(
        "http://localhost:4000",
        ""
      )
    ).toThrow("Worker authentication secret is required");
  });
});