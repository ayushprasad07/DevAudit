import { z } from "zod";

import { EcosystemSchema } from "./dependency";

export const AnalysisJobRequestSchema = z.object({
  repository: z.object({
    url: z.string().url(),
    commit: z
      .string()
      .regex(/^[0-9a-f]{7,64}$/i, "commit must be a valid Git commit SHA"),
  }),
  ecosystem: EcosystemSchema,
  timeoutMs: z.number().int().min(1_000).max(300_000),
});

export type AnalysisJobRequest = z.infer<typeof AnalysisJobRequestSchema>;
