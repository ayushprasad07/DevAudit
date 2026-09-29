import type { CommandOptions, CommandResult } from "./types";

export interface CommandExecuter{
    execute(command: string,args?: string[], options?: CommandOptions): Promise<CommandResult>
}