import type { WorkerAnalysisRequest } from "@/types/worker";

import type { WorkerDispatcher } from "./WorkerDispatcher";

export class FakeWorkerDispatcher implements WorkerDispatcher {
  public readonly dispatched: WorkerAnalysisRequest[] = [];

  async dispatch(request: WorkerAnalysisRequest): Promise<void> {
    this.dispatched.push(request);
  }
}