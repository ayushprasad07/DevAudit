
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { ManifestInspector } from "../ManifestInspector";

describe("ManifestInspector", () => {
    let repositoryPath: string;

    async function createRepository(): Promise<void> {
        repositoryPath = await mkdtemp(
            join(tmpdir(), "devaudit-manifest-test-"),
        );
    }

    afterEach(async () => {
        if (repositoryPath) {
            await rm(repositoryPath, {
                recursive: true,
                force: true,
            });
        }
    });

    it("detects JavaScript manifests", async () => {
        await createRepository();

        await writeFile(
            join(repositoryPath, "package.json"),
            "{}",
        );

        await writeFile(
            join(repositoryPath, "package-lock.json"),
            "{}",
        );

        const inspector = new ManifestInspector();
        const result = await inspector.inspect(
            repositoryPath,
            "javascript",
        );

        expect(result.manifests).toEqual([
            { path: "package-lock.json", kind: "package-lock" },
            { path: "package.json", kind: "package-json" },
        ]);
    });

    it("detects Python dependency manifests", async () => {
        await createRepository();

        await writeFile(
            join(repositoryPath, "requirements.txt"),
            "requests==2.32.0",
        );

        await writeFile(
            join(repositoryPath, "pyproject.toml"),
            "[project]",
        );

        const inspector = new ManifestInspector();
        const result = await inspector.inspect(
            repositoryPath,
            "python",
        );

        expect(result.manifests).toEqual([
            { path: "pyproject.toml", kind: "pyproject" },
            { path: "requirements.txt", kind: "requirements" },
        ]);
    });

    it("detects manifests in nested directories", async () => {
        await createRepository();

        const nestedDirectory = join(
            repositoryPath,
            "apps",
            "web",
        );

        await mkdir(nestedDirectory, { recursive: true });

        await writeFile(
            join(nestedDirectory, "package.json"),
            "{}",
        );

        const inspector = new ManifestInspector();
        const result = await inspector.inspect(
            repositoryPath,
            "javascript",
        );

        expect(result.manifests).toEqual([
            {
                path: "apps/web/package.json",
                kind: "package-json",
            },
        ]);
    });

    it("ignores generated and dependency directories", async () => {
        await createRepository();

        for (const directory of [
            "node_modules/example",
            ".git",
            "dist",
            ".venv",
        ]) {
            const fullDirectory = join(repositoryPath, directory);

            await mkdir(fullDirectory, { recursive: true });

            await writeFile(
                join(fullDirectory, "package.json"),
                "{}",
            );
        }

        const inspector = new ManifestInspector();
        const result = await inspector.inspect(
            repositoryPath,
            "javascript",
        );

        expect(result.manifests).toEqual([]);
    });

    it("returns an empty manifest list when none are found", async () => {
        await createRepository();

        await writeFile(
            join(repositoryPath, "README.md"),
            "# Example",
        );

        const inspector = new ManifestInspector();
        const result = await inspector.inspect(
            repositoryPath,
            "javascript",
        );

        expect(result).toEqual({
            ecosystem: "javascript",
            manifests: [],
        });
    });
});
