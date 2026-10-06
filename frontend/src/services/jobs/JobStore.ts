import type { Job } from "@/types/jobs";

export interface JobStore {
  create(job: Job): Promise<void>;

  get(jobId: string): Promise<Job | undefined>;

  update(job: Job): Promise<void>;
}
