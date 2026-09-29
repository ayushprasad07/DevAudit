export interface ExecutionPolicy{
    timeoutMs: number;
    maxOutputBytes: number;
    allowNetwork: boolean;
    allowedCommands: string[];
}