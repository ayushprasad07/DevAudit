
import { describe, expect, it, vi, beforeEach } from "vitest";

import { processJob } from "../processJob";
import type { WorkerAnalysisRequest } from "../../types/worker";
import { RepositoryPreparationError } from "@/repository/RepositoryManager";
import type { WorkerStatusClient } from "../WorkerStatusClient";
import type { ParsedDependencyManifestResult } from "@/repository/DependencyManifestParser";

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
            },
        );

        expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
            1,
            job.jobId,
            { status: "running" },
        );

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

        expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
            2,
            job.jobId,
            { status: "completed" },
        );

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
            },
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
            },
        );

        expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
            2,
            job.jobId,
            {
                status: "failed",
                error: {
                    code: "CLONE_FAILED",
                    message: "Failed to clone the repository",
                },
            },
        );
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
            },
        );

        expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
            2,
            job.jobId,
            {
                status: "failed",
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Could not read repository files",
                },
            },
        );
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
            },
        );

        expect(statusClient.updateStatus).toHaveBeenNthCalledWith(
            3,
            job.jobId,
            {
                status: "failed",
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Completion update failed",
                },
            },
        );
    });
});
