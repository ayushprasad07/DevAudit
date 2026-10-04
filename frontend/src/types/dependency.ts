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