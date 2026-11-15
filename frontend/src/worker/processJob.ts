import type { WorkerAnalysisRequest } from "@/types/worker";
import type { WorkerStatusClient } from "./WorkerStatusClient";
import type { AnalysisResult } from "@/types/jobs";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { NpmLockfileParser } from "@/repository/resolvers/NpmLockfileParser";
import { ResolvedDependencySchema, type ResolvedDependency } from "@/types/dependency";

import {
  RepositoryManager,
  RepositoryPreparationError,
  type RepositoryPreparationOptions,
} from "@/repository/RepositoryManager";

// import {
//     ManifestInspector,
//     type ManifestInspectionResult,
// } from "@/repository/ManifestInspector";

import { DependencyManifestParser } from "@/repository/DependencyManifestParser";

async function parseNpmLockfile(
  repositoryPath: string,
  ecosystem: string,
  parser: NpmLockfileParser,
): Promise<ResolvedDependency[] | undefined> {
  if (ecosystem !== "javascript") {
    return undefined;
  }

  const lockfilePath = path.join(repositoryPath, "package-lock.json");

  try {
    const content = await readFile(lockfilePath, "utf-8");

    console.log("NPM lockfile found:", lockfilePath);

    const resolvedDependencies = parser.parse(content);

    console.log(
    "Resolved dependencies parsed:",
    resolvedDependencies.length,
    );

    return resolvedDependencies;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

interface ProcessJobDependencies {
  repositoryManager: {
    withRepository<T>(
      options: RepositoryPreparationOptions,
      inspect: (repositoryPath: string) => Promise<T>,
    ): Promise<T>;
  };

  dependencyParser: Pick<DependencyManifestParser, "parse">;
  lockfileParser: Pick<NpmLockfileParser, "parse">;
}

export async function processJob(
  job: WorkerAnalysisRequest,
  statusClient: Pick<WorkerStatusClient, "updateStatus">,
  dependencies: ProcessJobDependencies = {
    repositoryManager: new RepositoryManager(),
    dependencyParser: new DependencyManifestParser(),
    lockfileParser: new NpmLockfileParser(),
  },
): Promise<void> {
    console.log("PROCESSJOB VERSION CHECK - UPDATED CODE LOADED");
  let markedRunning = false;

  try {
    await statusClient.updateStatus(job.jobId, { status: "running" });
    markedRunning = true;

    // TODO: Add repository preparation and dependency analysis here.
    // This step intentionally performs no repository operations.

    const result = await dependencies.repositoryManager.withRepository(
      {
        url: job.repository.url,
        commit: job.repository.commit,
        timeoutMs: job.timeoutMs,
      },
      async (repositoryPath) => {
        console.log("Repository path:", repositoryPath);

console.log(
  "Repository root files:",
  await import("node:fs/promises").then((fs) => fs.readdir(repositoryPath)),
);
        const manifestResult = await dependencies.dependencyParser.parse(
          repositoryPath,
          job.ecosystem,
        );

        const resolvedDependencies = await parseNpmLockfile(
          repositoryPath,
          job.ecosystem,
          dependencies.lockfileParser as NpmLockfileParser,
        );

        return {
          ...manifestResult,
          resolvedDependencies,
        };
      },
    );

    console.log(
      `Dependency parsing completed for ${job.jobId}. ` +
        `Ecosystem: ${result.ecosystem}. ` +
        `Dependencies found: ${result.dependencies.length}.`,
    );

    console.log(
      "Detected package manager:",
      result.packageManager ?? "Unknown",
    );

    console.log("Parsed dependencies:", JSON.stringify(result.dependencies));
    console.log(
        "Resolved dependencies:",
        result.resolvedDependencies?.length ?? "Not found",
    );

    const analysisResult: AnalysisResult = {
        ecosystem: result.ecosystem,
        ...(result.packageManager
            ? { packageManager: result.packageManager }
            : {}),
        dependencies: result.dependencies,
        ...(result.resolvedDependencies
            ? { resolvedDependencies: result.resolvedDependencies }
            : {}),
    };

    await statusClient.updateStatus(job.jobId, {
      status: "completed",
      result: analysisResult,
    });

    console.log("Worker completed job : ", job.jobId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown processing error";

    if (!markedRunning) {
      console.error(`Could not start job ${job.jobId}:`, message);
      return;
    }

    const code =
      error instanceof RepositoryPreparationError
        ? error.code
        : "INTERNAL_ERROR";

    try {
      await statusClient.updateStatus(job.jobId, {
        status: "failed",
        error: {
          code: code,
          message,
        },
      });
    } catch (reportingError) {
      console.error(
        `Could not report failure for job ${job.jobId}:`,
        reportingError,
      );
    }
  }
}
