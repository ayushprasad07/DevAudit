export interface CommandOptions {
    cwd?: string;
    timeoutMs?: number;
    env?: Record<string, string>;
}

export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
}