
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    mkdtemp: vi.fn(),
    rm: vi.fn(),
    git: {
        clone: vi.fn(),
        fetch: vi.fn(),
        checkout: vi.fn(),
        revparse: vi.fn(),
    },
    simpleGit: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
    mkdtemp: mocks.mkdtemp,
    rm: mocks.rm,
}));

vi.mock("node:os", () => ({
    tmpdir: vi.fn(() => "/tmp"),
}));

vi.mock("node:path", () => ({
    join: (...parts: string[]) => parts.join("/"),
}));

vi.mock("simple-git", () => ({
    default: mocks.simpleGit,
    simpleGit: mocks.simpleGit,
}));

import {
    RepositoryManager,
    RepositoryPreparationError,
} from "../RepositoryManager";

describe("RepositoryManager", () => {
    let manager: RepositoryManager;

    const validOptions = {
        url: "https://github.com/example/demo",
        commit: "a1b2c3d4e5f6789012345678901234567890abcd",
        timeoutMs: 60_000,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mkdtemp.mockResolvedValue("/tmp/devaudit-test");
        mocks.rm.mockResolvedValue(undefined);

        mocks.simpleGit.mockReturnValue(mocks.git);

        mocks.git.clone.mockResolvedValue(undefined);
        mocks.git.fetch.mockResolvedValue(undefined);
        mocks.git.checkout.mockResolvedValue(undefined);
        mocks.git.revparse.mockResolvedValue(
            validOptions.commit,
        );

        manager = new RepositoryManager();
    });

    it("clones and checks out the requested commit", async () => {
        const inspect = vi.fn().mockResolvedValue({
            packageJsonFound: true,
        });

        const result = await manager.withRepository(
            validOptions,
            inspect,
        );

        expect(mocks.git.clone).toHaveBeenCalledWith(
            "https://github.com/example/demo.git",
            "/tmp/devaudit-test/repository",
            [
                "--no-checkout",
                "--depth=1",
                "--filter=blob:none",
                "--no-recurse-submodules",
            ],
        );

        expect(mocks.git.fetch).toHaveBeenCalledWith([
            "--depth=1",
            "origin",
            validOptions.commit,
        ]);

        expect(mocks.git.checkout).toHaveBeenCalledWith([
            "--detach",
            "FETCH_HEAD",
        ]);

        expect(inspect).toHaveBeenCalledWith(
            "/tmp/devaudit-test/repository",
        );

        expect(result).toEqual({
            packageJsonFound: true,
        });

        expect(mocks.rm).toHaveBeenCalledWith(
            "/tmp/devaudit-test",
            { recursive: true, force: true },
        );
    });

    it("rejects a non-GitHub repository URL", async () => {
        await expect(
            manager.withRepository(
                {
                    ...validOptions,
                    url: "https://example.com/user/repo",
                },
                vi.fn(),
            ),
        ).rejects.toMatchObject({
            name: "RepositoryPreparationError",
            code: "POLICY_VIOLATION",
        });

        expect(mocks.mkdtemp).not.toHaveBeenCalled();
        expect(mocks.git.clone).not.toHaveBeenCalled();
    });

    it("rejects a GitHub URL that does not identify a repository", async () => {
        await expect(
            manager.withRepository(
                {
                    ...validOptions,
                    url: "https://github.com/",
                },
                vi.fn(),
            ),
        ).rejects.toMatchObject({
            code: "POLICY_VIOLATION",
        });

        expect(mocks.mkdtemp).not.toHaveBeenCalled();
    });

    it("rejects an invalid commit SHA", async () => {
        await expect(
            manager.withRepository(
                {
                    ...validOptions,
                    commit: "not-a-commit",
                },
                vi.fn(),
            ),
        ).rejects.toMatchObject({
            code: "POLICY_VIOLATION",
        });

        expect(mocks.mkdtemp).not.toHaveBeenCalled();
    });

    it("rejects a timeout outside the allowed range", async () => {
        await expect(
            manager.withRepository(
                {
                    ...validOptions,
                    timeoutMs: 500,
                },
                vi.fn(),
            ),
        ).rejects.toMatchObject({
            code: "POLICY_VIOLATION",
        });

        expect(mocks.mkdtemp).not.toHaveBeenCalled();
    });

    it("reports clone failures and cleans up", async () => {
        mocks.git.clone.mockRejectedValue(
            new Error("remote repository unavailable"),
        );

        await expect(
            manager.withRepository(validOptions, vi.fn()),
        ).rejects.toMatchObject({
            name: "RepositoryPreparationError",
            code: "CLONE_FAILED",
        });

        expect(mocks.rm).toHaveBeenCalledWith(
            "/tmp/devaudit-test",
            { recursive: true, force: true },
        );
    });

    it("reports checkout failures and cleans up", async () => {
        mocks.git.checkout.mockRejectedValue(
            new Error("checkout failed"),
        );

        await expect(
            manager.withRepository(validOptions, vi.fn()),
        ).rejects.toMatchObject({
            code: "CHECKOUT_FAILED",
        });

        expect(mocks.rm).toHaveBeenCalledWith(
            "/tmp/devaudit-test",
            { recursive: true, force: true },
        );
    });

    it("rejects a checkout that does not match the requested commit", async () => {
        mocks.git.revparse.mockResolvedValue(
            "ffffffffffffffffffffffffffffffffffffffff",
        );

        await expect(
            manager.withRepository(validOptions, vi.fn()),
        ).rejects.toMatchObject({
            code: "CHECKOUT_FAILED",
        });

        expect(mocks.rm).toHaveBeenCalledWith(
            "/tmp/devaudit-test",
            { recursive: true, force: true },
        );
    });

    it("cleans up when repository inspection fails", async () => {
        const inspect = vi.fn().mockRejectedValue(
            new Error("manifest inspection failed"),
        );

        await expect(
            manager.withRepository(validOptions, inspect),
        ).rejects.toThrow("manifest inspection failed");

        expect(mocks.rm).toHaveBeenCalledWith(
            "/tmp/devaudit-test",
            { recursive: true, force: true },
        );
    });

    it("uses the requested timeout for Git operations", async () => {
        await manager.withRepository(validOptions, vi.fn());

        expect(mocks.simpleGit).toHaveBeenCalledWith(
            expect.objectContaining({
                baseDir: "/tmp/devaudit-test",
                timeout: {
                    block: 60_000,
                    connection: 30_000,
                },
            }),
        );

        expect(mocks.simpleGit).toHaveBeenCalledWith(
            expect.objectContaining({
                baseDir: "/tmp/devaudit-test/repository",
                timeout: {
                    block: 60_000,
                    connection: 30_000,
                },
            }),
        );
    });
});
