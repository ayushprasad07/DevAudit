export type AnalysisStatus = 
    | "queued"
    | "cloning"
    | "analyzing"
    | "completed"
    | "failed"


export interface AnalysisJob{
    id : string;

    repository : {
        owner : string;
        name : string;
        url : string;
        branch : string;
        commit : string;
    }

    status : AnalysisStatus;

    createdAt : Date;
    startedAt ?: Date;
    completedAt ?: Date;

    error ?: string;
}