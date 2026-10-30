import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { simpleGit } from "simple-git";

import { RepositoryService } from "./RepositoryService";

export type RepositoryPreparationErrorCode =
    | "POLICY_VIOLATION"
    | "CLONE_FAILED"
    | "CHECKOUT_FAILED"
    | "TIMEOUT";

export class RepositoryPreparationError extends Error {
    constructor(public readonly code: RepositoryPreparationErrorCode, message : string) {
        super(message);
        this.name = "RepositoryPreparationError";
    }
}

export interface RepositoryPreparationOptions{
    url : string;
    commit : string;
    timeoutMs : number;
}

export class RepositoryManager{
    constructor(
        private readonly repositoryService = new RepositoryService(),
    ) {}

    async withRepository<T>(
        options: RepositoryPreparationOptions,
        inspect: (repositoryPath: string) => Promise<T>,
    ): Promise<T>{
        const { url, commit, timeoutMs } = options;

        if(!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 300_000){
            throw new RepositoryPreparationError(
                "POLICY_VIOLATION",
                "Repository timeout must be between 1000 and 300000 milliseconds",
            );
        }

        if (!/^[0-9a-f]{7,64}$/i.test(commit)) {
            throw new RepositoryPreparationError(
                "POLICY_VIOLATION",
                "Invalid Git commit SHA",
            );
        }

        let repositoryUrl : string;

        try{
            repositoryUrl = this.repositoryService.createRepository(url).url;
        }catch(error){
            throw new RepositoryPreparationError(
                "POLICY_VIOLATION",
                "Only valid HTTPS GitHub repository URLs are allowed",
            );
        }

        const workspace = await mkdtemp(join(tmpdir(), "devaudit-"));
        const repositoryPath = join(workspace, "repository");

        try{
            const gitOptions = {
                timeout:{
                    block : timeoutMs,
                    connection: Math.min(timeoutMs, 30_000),
                }
            }

            const git = simpleGit({
                baseDir : workspace,
                ...gitOptions
            });

            try {
                await git.clone(repositoryUrl, repositoryPath, [
                    "--no-checkout",
                    "--depth=1",
                    "--filter=blob:none",
                    "--no-recurse-submodules",
                ]);
            } catch (error) {
                throw this.toPreparationError(error, "CLONE_FAILED");
            }

            const repositoryGit = simpleGit({
                baseDir : repositoryPath,
                ...gitOptions
            });

            try {
                await repositoryGit.fetch([
                    "--depth=1",
                    "origin",
                    commit,
                ]);

                await repositoryGit.checkout([
                    "--detach",
                    "FETCH_HEAD",
                ]);

                const checkedOutCommit = (
                    await repositoryGit.revparse([
                        "HEAD"
                    ])
                ).trim().toLowerCase();

                if (!checkedOutCommit.startsWith(commit.toLowerCase())) {
                    throw new Error(
                        "Checked-out commit does not match the requested commit",
                    );
                }
            } catch (error) {
                throw this.toPreparationError(error, "CHECKOUT_FAILED");
            }

            return await inspect(repositoryPath);
        }finally{
            try {
                await rm(workspace, {recursive : true, force : true});
            } catch (error) {
                console.error(
                    `Failed to remove temporary repository workspace ${workspace}:`,
                    error,
                );
            }
        }
    }

    private toPreparationError(
        error : unknown,
        fallbackCode: "CLONE_FAILED" | "CHECKOUT_FAILED"
    ) : RepositoryPreparationError{
        const message = error instanceof Error ? error.message : "Unknown Git error";

        if (/timed?\s*out|timeout/i.test(message)) {
            return new RepositoryPreparationError(
                "TIMEOUT",
                "Repository preparation timed out",
            );
        }

        return new RepositoryPreparationError(
            fallbackCode,
            fallbackCode === "CLONE_FAILED"
                ? "Failed to clone the repository"
                : "Failed to fetch or check out the requested commit",
        );
    }
}