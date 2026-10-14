import type { WorkerAnalysisRequest } from "@/types/worker";
import type { WorkerStatusClient } from "./WorkerStatusClient";

export async function processJob(
    job: WorkerAnalysisRequest,
    statusClient: Pick<WorkerStatusClient, "updateStatus">
): Promise<void>{
    let markedRunning = false;

    try{
        await statusClient.updateStatus(job.jobId, { status: "running" });
        markedRunning = true;

        // TODO: Add repository preparation and dependency analysis here.
        // This step intentionally performs no repository operations.

        await statusClient.updateStatus(job.jobId, { status: "completed" });

        console.log("Worker completed job : ", job.jobId);
    }catch(error){
        const message = error instanceof Error ? error.message : "Unknown processing error";

        if(!markedRunning){
            console.error(`Could not start job ${job.jobId}:`, message);
            return;
        }

        try {
            await statusClient.updateStatus(job.jobId, {
                status: "failed",
                error: {
                code: "INTERNAL_ERROR",
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