import type { Job } from "@/types/jobs";

import { JobStore } from "./JobStore";

export class InMemoryJobStore implements JobStore {
    private jobs = new Map<string, Job>();

    async create(job: Job): Promise<void> {
        this.jobs.set(job.jobId, job);
    }

    async get(jobId: string): Promise<Job | undefined> {
        return this.jobs.get(jobId);
    }

    async update(job: Job): Promise<void> {
        this.jobs.set(job.jobId, job);
    }
}