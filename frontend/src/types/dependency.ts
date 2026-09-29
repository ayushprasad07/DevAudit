export type Ecosystem = 
    | "javascript"
    | "python"
    | "go"
    | "java"
    | "rust";

export interface Dependency{
    name: string;
    version: string;
    ecosystem: Ecosystem;
    direct ?: boolean;
    license ?: string;
    repositoryUrl ?: string;
}