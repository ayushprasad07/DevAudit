import type { WorkerAnalysisRequest } from "@/types/worker";
import type { WorkerDispatcher } from "./WorkerDispatcher";

export class HttpWorkerDispatcher implements WorkerDispatcher {
    constructor(
        private readonly workerUrl: string,
        private readonly workerSecret: string
    ){
        if (!workerUrl){
            throw new Error('Worker URL is required');
        }

        if (!workerSecret) {
            throw new Error("Worker authentication secret is required");
        }
    }

    async dispatch(request : WorkerAnalysisRequest) : Promise<void> {
        const response = await fetch(
            `${this.workerUrl.replace(/\/+$/, "")}/jobs`,{
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.workerSecret}`,
                },
                body : JSON.stringify(request),
                signal: AbortSignal.timeout(request.timeoutMs),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Worker dispatch failed with HTTP status ${response.status}`
            );
        }
    }
}