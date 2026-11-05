import { z } from "zod";

import {
    EcosystemSchema,
    PackageManagerSchema,
} from "./dependency";

export const JobStatusSchema = z.enum([
    "queued",
    "running",
    "completed",
    "failed",
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

export const AnalysisDependencySchema = z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    ecosystem: EcosystemSchema,
    direct: z.boolean().optional(),
    license: z.string().optional(),
    repositoryUrl: z.string().optional(),
})

export type AnalysisDependency = z.infer<typeof AnalysisDependencySchema>;

export const AnalysisResultSchema = z.object({
    ecosystem: EcosystemSchema,
    packageManager: PackageManagerSchema.optional(),
    dependencies: z.array(AnalysisDependencySchema),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const JobSchema = z.object({
    jobId: z.string().min(1),

    status: JobStatusSchema,

    createdAt: z.string().datetime(),

    startedAt: z.string().datetime().optional(),

    completedAt: z.string().datetime().optional(),

    result : AnalysisResultSchema.optional(),

    error: z
        .object({
        code: z.string().min(1),
        message: z.string().min(1),
        })
        .optional(),
});

export type Job = z.infer<typeof JobSchema>;