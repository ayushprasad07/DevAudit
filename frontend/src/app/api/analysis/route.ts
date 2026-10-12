import { NextResponse } from "next/server";

import { AnalysisJobService } from "@/services/analysis/AnalysisJobService";
import { JobManager } from "@/services/jobs/JobManager";
import { MongoJobStore } from "@/services/jobs/MongoJobStore";
import { AnalysisJobRequestSchema } from "@/types/analysisJob";
import { HttpWorkerDispatcher } from "@/services/worker/HttpWorkerDispatcher";


function getAnalysisJobService(): AnalysisJobService {
  const jobManager = new JobManager(new MongoJobStore());

  const workerUrl = process.env.WORKER_URL;
  const workerSecret = process.env.WORKER_SHARED_SECRET;

  if (!workerSecret || !workerUrl){
    throw new Error("Worker not configured properly");
  }

  const dispatcher = new HttpWorkerDispatcher(workerUrl, workerSecret);

  return new AnalysisJobService(jobManager, dispatcher);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = AnalysisJobRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid analysis request",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const service = getAnalysisJobService();

    const job = await service.createAnalysisJob(parsed.data);

    return NextResponse.json(
      {
        jobId: job.jobId,
        status: job.status,
      },
      { status: 202 }
    );
  } catch(error) {
    console.log("Error creating analysis job", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to create analysis job",
      },
      { status: 500 }
    );
  }
}