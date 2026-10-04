import { z } from "zod";

import {
  EcosystemSchema,
  PackageManagerSchema,
} from "./dependency";

export const WORKER_CONTRACT_VERSION = 1;

export const WorkerErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "CLONE_FAILED",
  "CHECKOUT_FAILED",
  "UNSUPPORTED_ECOSYSTEM",
  "UNSUPPORTED_PACKAGE_MANAGER",
  "TOOL_FAILED",
  "TIMEOUT",
  "RESOURCE_LIMIT",
  "POLICY_VIOLATION",
  "INTERNAL_ERROR",
]);

export type WorkerErrorCode = z.infer<typeof WorkerErrorCodeSchema>;

export const WorkerAnalysisRequestSchema = z.object({
  contractVersion : z.literal(WORKER_CONTRACT_VERSION),

  job_id : z.string().min(1),

  repository: z.object({
    url: z.string().url(),
    commit: z
      .string()
      .regex(
        /^[0-9a-f]{7,64}$/i,
        "commit must be a valid Git commit SHA"
      ),
  }),

  ecosystem : EcosystemSchema,

  timeoutMs: z
    .number()
    .int()
    .min(1_000)
    .max(300_000),
});

export type WorkerAnalysisRequest = z.infer<typeof WorkerAnalysisRequestSchema>

