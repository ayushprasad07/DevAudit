import { describe, expect, it } from "vitest";

import { AnalysisJobRequestSchema } from "../analysisJob";

const validRequest = {
  repository: {
    url: "https://github.com/example/demo",
    commit: "a1b2c3d4e5f6789012345678901234567890abcd",
  },
  ecosystem: "javascript",
  timeoutMs: 120_000,
};

describe("AnalysisJobRequestSchema", () => {
  it("accepts a valid JavaScript request", () => {
    const result =
      AnalysisJobRequestSchema.safeParse(validRequest);

    expect(result.success).toBe(true);
  });

  it("accepts a valid Python request", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      ecosystem: "python",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid repository URL", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      repository: {
        ...validRequest.repository,
        url: "not-a-url",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid commit SHA", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      repository: {
        ...validRequest.repository,
        commit: "not-a-commit",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported ecosystem", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      ecosystem: "java",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a timeout below the minimum", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      timeoutMs: 500,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a timeout above the maximum", () => {
    const result = AnalysisJobRequestSchema.safeParse({
      ...validRequest,
      timeoutMs: 400_000,
    });

    expect(result.success).toBe(false);
  });
});