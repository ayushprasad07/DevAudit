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

export type WorkerErrorCode = z.infer<
  typeof WorkerErrorCodeSchema
>;


/*
 * Worker request
 */

export const WorkerAnalysisRequestSchema = z.object({
  contractVersion: z.literal(WORKER_CONTRACT_VERSION),

  jobId: z.string().min(1),

  repository: z.object({
    url: z.string().url(),

    commit: z
      .string()
      .regex(
        /^[0-9a-f]{7,64}$/i,
        "commit must be a valid Git commit SHA"
      ),
  }),

  ecosystem: EcosystemSchema,

  timeoutMs: z
    .number()
    .int()
    .min(1_000)
    .max(300_000),
});

export type WorkerAnalysisRequest = z.infer<
  typeof WorkerAnalysisRequestSchema
>;


/*
 * Raw dependency graph
 *
 * This is intentionally the worker's raw graph.
 * License intelligence and higher-level analysis
 * will happen in the main TypeScript application.
 */

export const RawDependencySchema = z.object({
  name: z.string().min(1),

  version: z.string().min(1),

  dependencies: z.array(z.string()),
});

export type RawDependency = z.infer<
  typeof RawDependencySchema
>;

export const RawDependencyGraphSchema = z.object({
  root: z.string().min(1),

  dependencies: z.array(
    RawDependencySchema
  ),
});

export type RawDependencyGraph = z.infer<
  typeof RawDependencyGraphSchema
>;


/*
 * Worker response
 */

export const WorkerAnalysisResponseSchema =
  z.discriminatedUnion("status", [
    z.object({
      status: z.literal("ok"),

      jobId: z.string().min(1),

      contractVersion: z.literal(
        WORKER_CONTRACT_VERSION
      ),

      ecosystem: EcosystemSchema,

      packageManager: PackageManagerSchema,

      toolVersion: z.string().min(1),

      graph: RawDependencyGraphSchema,
    }),

    z.object({
      status: z.literal("error"),

      jobId: z.string().min(1),

      contractVersion: z.literal(
        WORKER_CONTRACT_VERSION
      ),

      error: z.object({
        code: WorkerErrorCodeSchema,

        message: z.string().min(1),
      }),
    }),
  ]);

export type WorkerAnalysisResponse = z.infer<
  typeof WorkerAnalysisResponseSchema
>;