import { z } from "zod";

export const EcosystemSchema = z.enum(
    [
        "javascript",
        "python"
    ]
)

export type Ecosystem = z.infer<typeof EcosystemSchema>

export const PackageManagerSchema = z.enum([
    "npm",
    "pnpm",
    "yarn",
    "pip",
    "uv",
    "poetry",
])

export type PackageManager = z.infer<typeof PackageManagerSchema>

export interface Dependency {
  name: string;
  version: string;
  ecosystem: Ecosystem;
  direct?: boolean;
  license?: string;
  repositoryUrl?: string;
}

export const ResolvedDependencySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  ecosystem: EcosystemSchema,
  direct: z.boolean(),
  dependencies: z.array(z.string()),
  integrity: z.string().optional(),
  resolvedUrl: z.string().optional(),
});

export type ResolvedDependency = z.infer<
  typeof ResolvedDependencySchema
>;