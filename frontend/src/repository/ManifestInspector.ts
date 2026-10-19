import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import type { Ecosystem } from "@/types/dependency";

export type ManifestKind =
    | "package-json"
    | "package-lock"
    | "npm-shrinkwrap"
    | "pnpm-lock"
    | "yarn-lock"
    | "bun-lock"
    | "requirements"
    | "pyproject"
    | "poetry-lock"
    | "uv-lock"
    | "pipfile"
    | "setup-py"
    | "setup-cfg";

export interface DetectedManifest{
    path : string;
    kind : ManifestKind
}

export interface ManifestInspectionResult{
    ecosystem : Ecosystem;
    manifests : DetectedManifest[];
}

const IGNORED_DIRECTORIES = new Set([
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    "dist",
    "build",
    "coverage",
]);

const MAX_DEPTH = 12;
const MAX_ENTRIES = 20_000;

const JAVASCRIPT_MANIFESTS: Record<string, ManifestKind> = {
    "package.json": "package-json",
    "package-lock.json": "package-lock",
    "npm-shrinkwrap.json": "npm-shrinkwrap",
    "pnpm-lock.yaml": "pnpm-lock",
    "yarn.lock": "yarn-lock",
    "bun.lock": "bun-lock",
    "bun.lockb": "bun-lock",
};

const PYTHON_MANIFESTS: Record<string, ManifestKind> = {
    "pyproject.toml": "pyproject",
    "poetry.lock": "poetry-lock",
    "uv.lock": "uv-lock",
    "pipfile": "pipfile",
    "pipfile.lock": "pipfile",
    "setup.py": "setup-py",
    "setup.cfg": "setup-cfg",
};