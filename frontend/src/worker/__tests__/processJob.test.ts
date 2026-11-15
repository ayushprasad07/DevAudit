import { describe, expect, it, vi, beforeEach } from "vitest";

import { processJob } from "../processJob";
import type { WorkerAnalysisRequest } from "../../types/worker";
import { RepositoryPreparationError } from "@/repository/RepositoryManager";
import type { WorkerStatusClient } from "../WorkerStatusClient";
import type { ParsedDependencyManifestResult } from "@/repository/DependencyManifestParser";

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { NpmLockfileParser } from "@/repository/resolvers/NpmLockfileParser";

type MockStatusClient = {
  updateStatus: ReturnType<typeof vi.fn>;
};

const job: WorkerAnalysisRequest = {
  contractVersion: 1,
  jobId: "job_test_123",
  repository: {
    url: "https://github.com/example/project",
    commit: "a".repeat(40),
  },
  ecosystem: "javascript",
  timeoutMs: 60_000,
};

const parsedResult: ParsedDependencyManifestResult = {
  ecosystem: "javascript",
  packageManager: "npm",
  dependencies: [
    {
      name: "express",
      version: "^4.18.0",
      ecosystem: "javascript",
      direct: true,
    },
  ],
  manifests: [
    { path: "package.json", kind: "package-json" },
    { path: "package-lock.json", kind: "package-lock" },
  ],
};

describe("processJob", () => {
  let statusClient: MockStatusClient;

  let repositoryManager: {
    withRepository: ReturnType<typeof vi.fn>;
  };

  let dependencyParser: {
    parse: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    statusClient = {
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };

    dependencyParser = {
      parse: vi.fn().mockResolvedValue(parsedResult),
    };

    repositoryManager = {
      withRepository: vi.fn(
        async (
          _options: unknown,
          inspect: (repositoryPath: string) => Promise<unknown>,
        ) => inspect("/tmp/devaudit-test/repository"),
      ),
    };
  });

  it("reports running, parses dependencies, then reports completed", async () => {
    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
  repositoryManager: repositoryManager as never,
  dependencyParser: dependencyParser as never,
  lockfileParser: {
    parse: vi.fn().mockReturnValue([]),
  },
}
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(1, job.jobId, {
      status: "running",
    });

    expect(repositoryManager.withRepository).toHaveBeenCalledWith(
      {
        url: job.repository.url,
        commit: job.repository.commit,
        timeoutMs: job.timeoutMs,
      },
      expect.any(Function),
    );

    expect(dependencyParser.parse).toHaveBeenCalledWith(
      "/tmp/devaudit-test/repository",
      "javascript",
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(2, job.jobId, {
      status: "completed",
      result: {
        ecosystem: "javascript",
        packageManager: "npm",
        dependencies: [
          {
            name: "express",
            version: "^4.18.0",
            ecosystem: "javascript",
            direct: true,
          },
        ],
      },
    });

    expect(statusClient.updateStatus).toHaveBeenCalledTimes(2);
  });

  it("does not report failure if the running update fails", async () => {
    statusClient.updateStatus.mockRejectedValue(
      new Error("Next.js is unavailable"),
    );

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
  repositoryManager: repositoryManager as never,
  dependencyParser: dependencyParser as never,
  lockfileParser: {
    parse: vi.fn().mockReturnValue([]),
  },
}
    );

    expect(statusClient.updateStatus).toHaveBeenCalledTimes(1);
    expect(repositoryManager.withRepository).not.toHaveBeenCalled();
  });

  it("reports a typed failure when repository cloning fails", async () => {
    repositoryManager.withRepository.mockRejectedValue(
      new RepositoryPreparationError(
        "CLONE_FAILED",
        "Failed to clone the repository",
      ),
    );

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
  repositoryManager: repositoryManager as never,
  dependencyParser: dependencyParser as never,
  lockfileParser: {
    parse: vi.fn().mockReturnValue([]),
  },
}
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(2, job.jobId, {
      status: "failed",
      error: {
        code: "CLONE_FAILED",
        message: "Failed to clone the repository",
      },
    });
  });

  it("reports an internal error when dependency parsing fails", async () => {
    dependencyParser.parse.mockRejectedValue(
      new Error("Could not read repository files"),
    );

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
  repositoryManager: repositoryManager as never,
  dependencyParser: dependencyParser as never,
  lockfileParser: {
    parse: vi.fn().mockReturnValue([]),
  },
}
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(2, job.jobId, {
      status: "failed",
      error: {
        code: "INTERNAL_ERROR",
        message: "Could not read repository files",
      },
    });
  });

  it("reports failure if completion reporting fails", async () => {
    statusClient.updateStatus
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Completion update failed"))
      .mockResolvedValueOnce(undefined);

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
  repositoryManager: repositoryManager as never,
  dependencyParser: dependencyParser as never,
  lockfileParser: {
    parse: vi.fn().mockReturnValue([]),
  },
}
    );

    expect(statusClient.updateStatus).toHaveBeenNthCalledWith(3, job.jobId, {
      status: "failed",
      error: {
        code: "INTERNAL_ERROR",
        message: "Completion update failed",
      },
    });
  });


it("includes resolved dependencies when package-lock.json exists", async () => {
  const repositoryPath = await mkdtemp(
    path.join(tmpdir(), "devaudit-lockfile-"),
  );

  try {
    const lockfile = {
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            express: "^4.18.0",
          },
        },
        "node_modules/express": {
          version: "4.21.2",
          dependencies: {
            alpha: "1.0.0",
            beta: "1.0.0",
          },
        },
        "node_modules/alpha": {
          version: "1.0.0",
          dependencies: {
            shared: "^1.0.0",
          },
        },
        "node_modules/beta": {
          version: "1.0.0",
          dependencies: {
            shared: "^2.0.0",
          },
        },
        "node_modules/shared": {
          version: "1.5.0",
        },
        "node_modules/beta/node_modules/shared": {
          version: "2.5.0",
        },
      },
    };

    await writeFile(
      path.join(repositoryPath, "package-lock.json"),
      JSON.stringify(lockfile),
      "utf-8",
    );

    repositoryManager.withRepository.mockImplementation(
      async (_options: unknown, inspect: (repositoryPath: string) => Promise<unknown>) =>
        inspect(repositoryPath),
    );

    const lockfileParser = new NpmLockfileParser();

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
        repositoryManager: repositoryManager as never,
        dependencyParser: dependencyParser as never,
        lockfileParser,
      },
    );

    const completedUpdate = statusClient.updateStatus.mock.calls.find(
      (call) => call[1].status === "completed",
    );

    expect(completedUpdate).toBeDefined();

    const result = completedUpdate![1].result;

    expect(result.resolvedDependencies).toHaveLength(5);

    const sharedPackages = result.resolvedDependencies.filter(
      (pkg: { name: string }) => pkg.name === "shared",
    );

    expect(sharedPackages).toHaveLength(2);

    expect(sharedPackages.map(
      (pkg: { version: string }) => pkg.version,
    ).sort()).toEqual(["1.5.0", "2.5.0"]);

    const beta = result.resolvedDependencies.find(
      (pkg: { name: string }) => pkg.name === "beta",
    );

    expect(beta?.dependencies).toEqual([
      "node_modules/beta/node_modules/shared",
    ]);
  } finally {
    await rm(repositoryPath, { recursive: true, force: true });
  }
});

it("completes successfully when package-lock.json is missing", async () => {
  const repositoryPath = await mkdtemp(
    path.join(tmpdir(), "devaudit-no-lockfile-"),
  );

  try {
    repositoryManager.withRepository.mockImplementation(
      async (_options: unknown, inspect: (repositoryPath: string) => Promise<unknown>) =>
        inspect(repositoryPath),
    );

    await processJob(
      job,
      statusClient as unknown as Pick<WorkerStatusClient, "updateStatus">,
      {
        repositoryManager: repositoryManager as never,
        dependencyParser: dependencyParser as never,
        lockfileParser: new NpmLockfileParser(),
      },
    );

    const completedUpdate = statusClient.updateStatus.mock.calls.find(
      (call) => call[1].status === "completed",
    );

    expect(completedUpdate).toBeDefined();

    expect(completedUpdate![1].result.dependencies).toHaveLength(1);

    expect(
      completedUpdate![1].result.resolvedDependencies,
    ).toBeUndefined();
  } finally {
    await rm(repositoryPath, { recursive: true, force: true });
  }
});
});
