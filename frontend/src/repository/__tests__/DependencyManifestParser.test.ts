
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { DependencyManifestParser } from "../DependencyManifestParser";

describe("DependencyManifestParser", () => {
    let repositoryPath: string | undefined;

    async function createRepository(): Promise<string> {
        repositoryPath = await mkdtemp(
            join(tmpdir(), "devaudit-parser-test-"),
        );

        return repositoryPath;
    }

    afterEach(async () => {
        if (repositoryPath) {
            await rm(repositoryPath, {
                recursive: true,
                force: true,
            });

            repositoryPath = undefined;
        }
    });

    it("parses JavaScript dependencies and detects npm", async () => {
        const root = await createRepository();

        await writeFile(
            join(root, "package.json"),
            JSON.stringify({
                dependencies: {
                    express: "^4.18.0",
                },
                devDependencies: {
                    vitest: "^4.0.0",
                },
                optionalDependencies: {
                   "optional-lib":  "~1.2.0",
                },
                peerDependencies: {
                    react: ">=18",
                },
            }),
        );

        await writeFile(join(root, "package-lock.json"), "{}");

        const result = await new DependencyManifestParser().parse(
            root,
            "javascript",
        );

        expect(result.packageManager).toBe("npm");

        expect(result.dependencies).toEqual(
            expect.arrayContaining([
                {
                    name: "express",
                    version: "^4.18.0",
                    ecosystem: "javascript",
                    direct: true,
                },
                {
                    name: "vitest",
                    version: "^4.0.0",
                    ecosystem: "javascript",
                    direct: true,
                },
                {
                    name: "optional-lib",
                    version: "~1.2.0",
                    ecosystem: "javascript",
                    direct: true,
                },
                {
                    name: "react",
                    version: ">=18",
                    ecosystem: "javascript",
                    direct: true,
                },
            ]),
        );

        expect(result.dependencies).toHaveLength(4);
    });

    it("parses Python requirements and detects pip", async () => {
        const root = await createRepository();

        await writeFile(
            join(root, "requirements.txt"),
            [
                "# project dependencies",
                "requests==2.32.0",
                "flask>=3.0,<4.0",
                "numpy~=2.0",
                "",
            ].join("\n"),
        );

        const result = await new DependencyManifestParser().parse(
            root,
            "python",
        );

        expect(result.packageManager).toBe("pip");

        expect(result.dependencies).toEqual(
            expect.arrayContaining([
                {
                    name: "requests",
                    version: "==2.32.0",
                    ecosystem: "python",
                    direct: true,
                },
                {
                    name: "flask",
                    version: ">=3.0,<4.0",
                    ecosystem: "python",
                    direct: true,
                },
                {
                    name: "numpy",
                    version: "~=2.0",
                    ecosystem: "python",
                    direct: true,
                },
            ]),
        );

        expect(result.dependencies).toHaveLength(3);
    });

    it("returns no dependencies when no supported manifests exist", async () => {
        const root = await createRepository();

        await writeFile(join(root, "README.md"), "# Demo");

        const result = await new DependencyManifestParser().parse(
            root,
            "javascript",
        );

        expect(result.dependencies).toEqual([]);
        expect(result.packageManager).toBeUndefined();
    });

    it("rejects malformed package.json", async () => {
        const root = await createRepository();

        await writeFile(join(root, "package.json"), "{ invalid json");

        await expect(
            new DependencyManifestParser().parse(root, "javascript"),
        ).rejects.toThrow("Invalid JSON in package.json");
    });

    it("detects pnpm from its lockfile", async () => {
        const root = await createRepository();

        await writeFile(
            join(root, "package.json"),
            JSON.stringify({
                dependencies: {
                    lodash: "^4.17.0",
                },
            }),
        );

        await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");

        const result = await new DependencyManifestParser().parse(
            root,
            "javascript",
        );

        expect(result.packageManager).toBe("pnpm");
        expect(result.dependencies).toHaveLength(1);
    });

    it("finds manifests in nested directories", async () => {
        const root = await createRepository();
        const nested = join(root, "apps", "web");

        await mkdir(nested, { recursive: true });

        await writeFile(
            join(nested, "package.json"),
            JSON.stringify({
                dependencies: {
                    next: "^16.0.0",
                },
            }),
        );

        const result = await new DependencyManifestParser().parse(
            root,
            "javascript",
        );

        expect(result.dependencies).toEqual([
            {
                name: "next",
                version: "^16.0.0",
                ecosystem: "javascript",
                direct: true,
            },
        ]);
    });
});
