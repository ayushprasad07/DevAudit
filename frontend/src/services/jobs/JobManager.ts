import type { Job } from "@/types/jobs";

import type { JobStore } from "./JobStore";

export class JobManager {
  constructor(private readonly store: JobStore) {}

  async create(jobId: string): Promise<Job> {
    const job: Job = {
      jobId,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    await this.store.create(job);

    return job;
  }

  async get(jobId: string): Promise<Job | undefined> {
    return this.store.get(jobId);
  }

  async start(jobId: string): Promise<Job> {
    const job = await this.getOrThrow(jobId);

    if (job.status !== "queued") {
      throw new Error(
        `Cannot start job ${jobId} from status ${job.status}`
      );
    }

    job.status = "running";
    job.startedAt = new Date().toISOString();

    await this.store.update(job);

    return job;
  }

  async complete(jobId: string): Promise<Job> {
    const job = await this.getOrThrow(jobId);

    if (job.status !== "running") {
      throw new Error(
        `Cannot complete job ${jobId} from status ${job.status}`
      );
    }

    job.status = "completed";
    job.completedAt = new Date().toISOString();

    await this.store.update(job);

    return job;
  }

  async fail(
    jobId: string,
    code: string,
    message: string
  ): Promise<Job> {
    const job = await this.getOrThrow(jobId);

    if (job.status !== "running") {
      throw new Error(
        `Cannot fail job ${jobId} from status ${job.status}`
      );
    }

    job.status = "failed";
    job.completedAt = new Date().toISOString();
    job.error = {
      code,
      message,
    };

    await this.store.update(job);

    return job;
  }

  private async getOrThrow(jobId: string): Promise<Job> {
    const job = await this.store.get(jobId);

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    return job;
  }
}