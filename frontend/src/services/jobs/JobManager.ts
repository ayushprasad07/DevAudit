import type { Job } from "@/types/jobs";

export class JobManager{
    private jobs = new Map<string, Job>();

    create (jobId : string) : Job{
        const job : Job = {
            jobId,
            status: "queued",
            createdAt: new Date().toISOString(),
        };

        this.jobs.set(jobId, job);

        return job;
    }

    get(jobId: string): Job | undefined {
        return this.jobs.get(jobId);
    }

    start(jobId : string) : Job{
        const job = this.getOrThrow(jobId);

        if (job.status !== "queued"){
            throw new Error(`Cannot start job ${jobId} from status ${job.status}`);
        }

        job.status = "running";
        job.startedAt = new Date().toISOString();

        return job;
    }

    complete(jobId : string) : Job{
        const job = this.getOrThrow(jobId);

        if (job.status !== "running"){
            throw new Error(`Cannot complete job ${jobId} from status ${job.status}`);
        }

        job.status = "completed";
        job.completedAt = new Date().toISOString();

        return job;
    }

    fail(jobId : string, code :string, message : string) : Job{
        const job = this.getOrThrow(jobId);

        if (job.status !== "running"){
            throw new Error(`Cannot fail job ${jobId} from status ${job.status}`);
        }

        job.status = "failed";
        job.completedAt = new Date().toISOString();
        job.error = { code, message };

        return job;
    }

    private getOrThrow(jobId : string) : Job{
        const job = this.get(jobId);

        if (!job){
            throw new Error(`Job not found: ${jobId}`);
        }

        return job;
    }
}