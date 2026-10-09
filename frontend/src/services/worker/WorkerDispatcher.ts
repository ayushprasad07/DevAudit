import type { WorkerAnalysisRequest } from "@/types/worker";

export interface WorkerDispatcher {
    dispatch(request: WorkerAnalysisRequest): Promise<void>;
}