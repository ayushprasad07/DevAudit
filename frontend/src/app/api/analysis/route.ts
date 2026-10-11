import { NextResponse } from "next/server";

import { AnalysisJobService } from "@/services/analysis/AnalysisJobService";
import { JobManager } from "@/services/jobs/JobManager";
import { MongoJobStore } from "@/services/jobs/MongoJobStore";
import { AnalysisJobRequestSchema } from "@/types/analysisJob";

function getAnalysisJobService(): AnalysisJobService {
  const jobManager = new JobManager(new MongoJobStore());

  // Temporary placeholder.
  // We'll replace this with the real worker dispatcher next.
  throw new Error("Worker dispatcher not configured");
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
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to create analysis job",
      },
      { status: 500 }
    );
  }
}