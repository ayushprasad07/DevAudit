import { describe, expect, it } from "vitest";

import { FakeWorkerDispatcher } from "../FakeWorkerDispatcher";

describe("FakeWorkerDispatcher", () => {
  it("records a dispatched worker request", async () => {
    const dispatcher = new FakeWorkerDispatcher();

    const request = {
      contractVersion: 1 as const,
      jobId: "job_123",
      repository: {
        url: "https://github.com/example/demo",
        commit: "a1b2c3d4e5f6789012345678901234567890abcd",
      },
      ecosystem: "javascript" as const,
      timeoutMs: 120_000,
    };

    await dispatcher.dispatch(request);

    expect(dispatcher.dispatched).toEqual([request]);
  });
});