export interface WorkerAnalysisRequest {
  jobId: string;

  repository: {
    url: string;
    branch: string;
    commit: string;
  };
}