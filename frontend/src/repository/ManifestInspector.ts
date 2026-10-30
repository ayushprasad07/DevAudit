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

function detectManifest(
    filename : string,
    ecosystem : Ecosystem
) : ManifestKind | undefined {
    const normalized = filename.toLowerCase();

    if (ecosystem === "javascript"){
        return JAVASCRIPT_MANIFESTS[normalized];
    }

    if (ecosystem === "python"){
        if(
            normalized === "requirements.txt" ||
            /^requirements[-_.][^/]+\.txt$/.test(normalized)
        ) {
            return "requirements";
        }

        return PYTHON_MANIFESTS[normalized];
    }

    return undefined;
}

export class ManifestInspector {
    async inspect(
        reposirotryPath : string,
        ecosystem : Ecosystem
    ) : Promise<ManifestInspectionResult> {
        const manifests : DetectedManifest[] = [];

        let entriesVisited = 0;

        const walk = async (
            directory : string,
            depth : number
        ) : Promise<void> => {
            if (depth > MAX_DEPTH){
                return;
            }

            const entries = await readdir(directory, { withFileTypes: true });

            for (const entry of entries){
                entriesVisited += 1;

                if(entriesVisited > MAX_ENTRIES){
                    throw new Error(
                        `Repository exceeds the inspection limit of ${MAX_ENTRIES} entries`,
                    );
                }

                if(entry.isSymbolicLink()){
                    continue;
                }

                const fullPath = join(directory, entry.name);

                if(entry.isDirectory()){
                    if (!IGNORED_DIRECTORIES.has(entry.name)) {
                        await walk(fullPath, depth + 1);
                    }

                    continue;
                }

                if (!entry.isFile()){
                    continue;
                }

                const kind = detectManifest(entry.name, ecosystem);

                if (kind){
                    manifests.push({
                        path: relative(reposirotryPath, fullPath).split(sep).join("/"),
                        kind,
                    });
                }
            }
        };

        await walk(reposirotryPath, 0);

        manifests.sort((a, b) => a.path.localeCompare(b.path));

        return {
            ecosystem,
            manifests: manifests,
        };
    }
}