
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type {
    Dependency,
    Ecosystem,
    PackageManager,
} from "@/types/dependency";

import {
    ManifestInspector,
    type DetectedManifest,
    type ManifestKind,
} from "./ManifestInspector";

export interface ParsedDependencyManifestResult {
    ecosystem: Ecosystem;
    packageManager?: PackageManager;
    dependencies: Dependency[];
    manifests: DetectedManifest[];
}

export class DependencyManifestParser {
    constructor(
        private readonly manifestInspector = new ManifestInspector(),
    ) {}

    async parse(
        repositoryPath: string,
        ecosystem: Ecosystem,
    ): Promise<ParsedDependencyManifestResult> {
        const inspection = await this.manifestInspector.inspect(
            repositoryPath,
            ecosystem,
        );

        const dependencies = new Map<string, Dependency>();

        for (const manifest of inspection.manifests) {
            if (manifest.kind === "package-json") {
                const content = await readFile(
                    join(repositoryPath, manifest.path),
                    "utf8",
                );

                this.parsePackageJson(
                    content,
                    dependencies,
                    manifest.path,
                );
            }

            if (manifest.kind === "requirements") {
                const content = await readFile(
                    join(repositoryPath, manifest.path),
                    "utf8",
                );

                this.parseRequirements(
                    content,
                    dependencies,
                    manifest.path,
                );
            }
        }

        return {
            ecosystem,
            packageManager: this.detectPackageManager(
                inspection.manifests,
                ecosystem,
            ),
            dependencies: [...dependencies.values()].sort(
                (a, b) => a.name.localeCompare(b.name),
            ),
            manifests: inspection.manifests,
        };
    }

    private parsePackageJson(
        content: string,
        dependencies: Map<string, Dependency>,
        manifestPath: string,
    ): void {
        let parsed: unknown;

        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error(
                `Invalid JSON in ${manifestPath}`,
            );
        }

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            throw new Error(
                `Invalid package manifest in ${manifestPath}`,
            );
        }

        const packageJson = parsed as Record<string, unknown>;

        const sections = [
            "dependencies",
            "devDependencies",
            "optionalDependencies",
            "peerDependencies",
        ];

        for (const section of sections) {
            const value = packageJson[section];

            if (value === undefined) {
                continue;
            }

            if (
                typeof value !== "object" ||
                value === null ||
                Array.isArray(value)
            ) {
                throw new Error(
                    `Invalid ${section} in ${manifestPath}`,
                );
            }

            for (const [name, version] of Object.entries(value)) {
                if (
                    typeof version !== "string" ||
                    version.trim() === ""
                ) {
                    throw new Error(
                        `Invalid version specification for ${name} in ${manifestPath}`,
                    );
                }

                // Keep the first specification if a package appears in
                // more than one dependency section.
                if (!dependencies.has(`javascript:${name.toLowerCase()}`)) {
                    dependencies.set(
                        `javascript:${name.toLowerCase()}`,
                        {
                            name,
                            version: version.trim(),
                            ecosystem: "javascript",
                            direct: true,
                        },
                    );
                }
            }
        }
    }

    private parseRequirements(
        content: string,
        dependencies: Map<string, Dependency>,
        manifestPath: string,
    ): void {
        for (const [index, originalLine] of content.split(/\r?\n/).entries()) {
            const lineNumber = index + 1;
            const line = originalLine.trim();

            if (
                line === "" ||
                line.startsWith("#") ||
                line.startsWith("-")
            ) {
                // Skip comments, pip options, editable installs, and
                // include directives in this initial parser.
                continue;
            }

            // Remove an inline comment when it is separated by whitespace.
            const requirement = line.split(/\s+#/, 1)[0].trim();

            // Support common PEP 508 names, extras, and version specifiers.
            // Direct URL/VCS references and environment markers are not
            // resolved in this initial implementation.
            const match = requirement.match(
                /^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]+\])?\s*(.*)$/,
            );

            if (!match) {
                throw new Error(
                    `Unsupported requirement at ${manifestPath}:${lineNumber}`,
                );
            }

            const name = match[1];
            const specification = match[2].trim();

            if (
                specification !== "" &&
                !/^(?:===|==|~=|!=|<=|>=|<|>|\s|,|\d|[A-Za-z_*])/.test(
                    specification,
                )
            ) {
                throw new Error(
                    `Unsupported version specification at ${manifestPath}:${lineNumber}`,
                );
            }

            const key = `python:${name.toLowerCase().replace(/[-_.]+/g, "-")}`;

            if (!dependencies.has(key)) {
                dependencies.set(key, {
                    name,
                    version: specification || "*",
                    ecosystem: "python",
                    direct: true,
                });
            }
        }
    }

    private detectPackageManager(
        manifests: DetectedManifest[],
        ecosystem: Ecosystem,
    ): PackageManager | undefined {
        const kinds = new Set<ManifestKind>(
            manifests.map((manifest) => manifest.kind),
        );

        if (ecosystem === "javascript") {
            if (kinds.has("pnpm-lock")) return "pnpm";
            if (kinds.has("yarn-lock")) return "yarn";

            if (
                kinds.has("package-lock") ||
                kinds.has("npm-shrinkwrap")
            ) {
                return "npm";
            }

            return undefined;
        }

        if (kinds.has("uv-lock")) return "uv";
        if (kinds.has("poetry-lock")) return "poetry";

        if (
            kinds.has("requirements") ||
            kinds.has("setup-py") ||
            kinds.has("setup-cfg")
        ) {
            return "pip";
        }

        return undefined;
    }
}
