import type { WorkerAnalysisRequest } from "@/types/worker";
import type { WorkerStatusClient } from "./WorkerStatusClient";
import type { AnalysisResult } from "@/types/jobs";

import {
    RepositoryManager,
    RepositoryPreparationError,
    type RepositoryPreparationOptions,
} from "@/repository/RepositoryManager";
import {
    ManifestInspector,
    type ManifestInspectionResult,
} from "@/repository/ManifestInspector";

import {DependencyManifestParser} from "@/repository/DependencyManifestParser";

interface ProcessJobDependencies {
    repositoryManager: {
        withRepository<T>(
            options: RepositoryPreparationOptions,
            inspect: (repositoryPath: string) => Promise<T>,
        ): Promise<T>;
    };

    dependencyParser: Pick<DependencyManifestParser, "parse">;
}

export async function processJob(
    job: WorkerAnalysisRequest,
    statusClient: Pick<WorkerStatusClient, "updateStatus">,
    dependencies : ProcessJobDependencies = {
        repositoryManager : new RepositoryManager(),
        dependencyParser : new DependencyManifestParser()
    }
): Promise<void>{
    let markedRunning = false;

    try{
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
            (repositoryPath) =>
                dependencies.dependencyParser.parse(
                    repositoryPath,
                    job.ecosystem,
                ),
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

        console.log(
            "Parsed dependencies:",
            JSON.stringify(result.dependencies),
        );

        const analysisResult : AnalysisResult = {
            ecosystem: result.ecosystem,
            ...(result.packageManager
                ? { packageManager: result.packageManager }
                : {}),
            dependencies: result.dependencies,
        }

        await statusClient.updateStatus(job.jobId, { status: "completed", result : analysisResult });

        console.log("Worker completed job : ", job.jobId);
    }catch(error){
        const message = error instanceof Error ? error.message : "Unknown processing error";

        if(!markedRunning){
            console.error(`Could not start job ${job.jobId}:`, message);
            return;
        }

        const code = error instanceof RepositoryPreparationError ? error.code : "INTERNAL_ERROR";

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