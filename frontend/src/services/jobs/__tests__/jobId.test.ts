import { describe, expect, it } from "vitest";

import { generateJobId } from "../jobId";

describe("generateJobId", () => {
  it("generates a job ID with the expected format", () => {
    const jobId = generateJobId();

    expect(jobId).toMatch(
      /^job_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("generates unique job IDs", () => {
    const first = generateJobId();
    const second = generateJobId();

    expect(first).not.toBe(second);
  });
});