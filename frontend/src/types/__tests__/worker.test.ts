import { describe, expect, it } from "vitest";

import {
  WorkerAnalysisRequestSchema,
  WorkerAnalysisResponseSchema,
} from "../worker";

describe("WorkerAnalysisRequestSchema", () => {
  const validRequest = {
    contractVersion: 1,
    jobId: "job_123",
    repository: {
      url: "https://github.com/example/demo",
      commit: "a1b2c3d4e5f6789012345678901234567890abcd",
    },
    ecosystem: "javascript",
    timeoutMs: 120_000,
  };

  it("accepts a valid JavaScript request", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse(validRequest);

    console.log(result)
    expect(result.success).toBe(true);
  });

  it("accepts a valid Python request", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        ecosystem: "python",
      });

    console.log(result)
expect(result.success).toBe(true);
  });

  it("rejects npm as an ecosystem", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        ecosystem: "npm",
      });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported ecosystems", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        ecosystem: "go",
      });

    expect(result.success).toBe(false);
  });

  it("rejects a missing commit", () => {
    const request = {
      ...validRequest,
      repository: {
        url: validRequest.repository.url,
      },
    };

    const result =
      WorkerAnalysisRequestSchema.safeParse(request);

    expect(result.success).toBe(false);
  });

  it("rejects an invalid commit SHA", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        repository: {
          ...validRequest.repository,
          commit: "not-a-commit",
        },
      });

    expect(result.success).toBe(false);
  });

  it("rejects a timeout below the minimum", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        timeoutMs: 500,
      });

    expect(result.success).toBe(false);
  });

  it("rejects a timeout above the maximum", () => {
    const result =
      WorkerAnalysisRequestSchema.safeParse({
        ...validRequest,
        timeoutMs: 400_000,
      });

    expect(result.success).toBe(false);
  });
});


describe("WorkerAnalysisResponseSchema", () => {
  const validGraph = {
    root: "demo",
    dependencies: [
      {
        name: "react",
        version: "19.2.0",
        dependencies: [],
      },
    ],
  };

  it("accepts a successful response", () => {
    const response = {
      status: "ok",
      jobId: "job_123",
      contractVersion: 1,
      ecosystem: "javascript",
      packageManager: "npm",
      toolVersion: "11.6.2",
      graph: validGraph,
    };

    const result =
      WorkerAnalysisResponseSchema.safeParse(response);

    console.log(result)
expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const response = {
      status: "error",
      jobId: "job_123",
      contractVersion: 1,
      error: {
        code: "TIMEOUT",
        message: "Dependency resolution timed out",
      },
    };

    const result =
      WorkerAnalysisResponseSchema.safeParse(response);

    console.log(result)
expect(result.success).toBe(true);
  });

  it("rejects an unknown error code", () => {
    const response = {
      status: "error",
      jobId: "job_123",
      contractVersion: 1,
      error: {
        code: "SOMETHING_RANDOM",
        message: "Something happened",
      },
    };

    const result =
      WorkerAnalysisResponseSchema.safeParse(response);

    expect(result.success).toBe(false);
  });

  it("rejects a successful response without a graph", () => {
    const response = {
      status: "ok",
      jobId: "job_123",
      contractVersion: 1,
      ecosystem: "javascript",
      packageManager: "npm",
      toolVersion: "11.6.2",
    };

    const result =
      WorkerAnalysisResponseSchema.safeParse(response);

    expect(result.success).toBe(false);
  });

  it("rejects an error response without an error object", () => {
    const response = {
      status: "error",
      jobId: "job_123",
      contractVersion: 1,
    };

    const result =
      WorkerAnalysisResponseSchema.safeParse(response);

    expect(result.success).toBe(false);
  });
});