import { JobManager } from "../jobs/JobManager";
import { generateJobId } from "../jobs/jobId";
import type { WorkerDispatcher } from "../worker/WorkerDispatcher";
import {
  WORKER_CONTRACT_VERSION,
  type WorkerAnalysisRequest,
} from "@/types/worker";
import type { AnalysisJobRequest } from "@/types/analysisJob";

export class AnalysisJobService {
  constructor(
    private readonly jobManager: JobManager,
    private readonly dispatcher: WorkerDispatcher
  ) {}

  async createAnalysisJob(request : AnalysisJobRequest){
    const jobId = generateJobId();

    const job = await this.jobManager.create(jobId);

    const workerRequest : WorkerAnalysisRequest = {
        contractVersion: WORKER_CONTRACT_VERSION,
        jobId,
        repository: request.repository,
        ecosystem: request.ecosystem,
        timeoutMs: request.timeoutMs,
    }

    try {
      await this.dispatcher.dispatch(workerRequest);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Worker dispatch failed";   
      await this.jobManager.failBeforeStart(
        jobId,
        "DISPATCH_FAILED",
        message
      );

      throw error;  
    }

    return job;
  }
}