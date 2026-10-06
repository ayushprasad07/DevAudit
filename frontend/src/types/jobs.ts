import { z } from "zod";

export const JobStatusSchema = z.enum([
    "queued",
    "running",
    "completed",
    "failed",
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobSchema = z.object({
    jobId: z.string().min(1),

    status: JobStatusSchema,

    createdAt: z.string().datetime(),

    startedAt: z.string().datetime().optional(),

    completedAt: z.string().datetime().optional(),

    error: z
        .object({
        code: z.string().min(1),
        message: z.string().min(1),
        })
        .optional(),
});

export type Job = z.infer<typeof JobSchema>;