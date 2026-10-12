import { afterEach, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";

import { createWorkerServer } from "../server";
import type { WorkerAnalysisRequest } from "../../types/worker";

const TEST_SECRET = "test-worker-secret";

const validRequest: WorkerAnalysisRequest = {
  contractVersion: 1,
  jobId: "job_test_123",
  repository: {
    url: "https://github.com/example/project",
    commit: "a".repeat(40),
  },
  ecosystem: "javascript",
  timeoutMs: 60_000,
};

const servers: ReturnType<typeof createWorkerServer>[] = [];

async function startServer(
  onJobAccepted = vi.fn(async (_request: WorkerAnalysisRequest) => {})
) {
  const server = createWorkerServer({
    sharedSecret: TEST_SECRET,
    onJobAccepted,
  });

  servers.push(server);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}`;

  return { url, onJobAccepted };
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        })
    )
  );
});

describe("Worker HTTP server", () => {
  it("accepts an authenticated, valid job", async () => {
    const { url, onJobAccepted } = await startServer();

    const response = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRequest),
    });

    const responseBody = await response.json();

    console.log("Worker response status:", response.status);
    console.log("Worker response body:", responseBody);

    expect(response.status).toBe(202);
    expect(responseBody).toEqual({
      status: "accepted",
      jobId: validRequest.jobId,
      contractVersion: 1,
    });

    expect(onJobAccepted).toHaveBeenCalledWith(validRequest);
  });

  it("rejects a request without valid authentication", async () => {
    const { url, onJobAccepted } = await startServer();

    const response = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRequest),
    });

    expect(response.status).toBe(401);
    expect(onJobAccepted).not.toHaveBeenCalled();
  });

  it("rejects an invalid worker request", async () => {
    const { url, onJobAccepted } = await startServer();

    const response = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validRequest.repository,
        commit: "invalid",
      }),
    });

    expect(response.status).toBe(400);
    expect(onJobAccepted).not.toHaveBeenCalled();
  });

  it("rejects unknown routes", async () => {
    const { url } = await startServer();

    const response = await fetch(`${url}/unknown`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_SECRET}`,
      },
    });

    expect(response.status).toBe(404);
  });

  it("returns 503 if the job acceptance handler fails", async () => {
    const onJobAccepted = vi.fn(async () => {
      throw new Error("Queue unavailable");
    });

    const { url } = await startServer(onJobAccepted);

    const response = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TEST_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRequest),
    });

    expect(response.status).toBe(503);
  });
});