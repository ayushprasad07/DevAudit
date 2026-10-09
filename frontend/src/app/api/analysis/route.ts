import { NextResponse } from "next/server";

import { JobManager } from "@/services/jobs/JobManager";
import { MongoJobStore } from "@/services/jobs/MongoJobStore";
import { generateJobId } from "@/services/jobs/jobId";
import  {AnalysisJobRequestSchema}  from "@/types/analysisJob";

function getJobManager(): JobManager {
  return new JobManager(new MongoJobStore());
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

    const jobId = generateJobId();

    const job = await getJobManager().create(jobId);

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
        message: "Invalid request body",
      },
      { status: 400 }
    );
  }
}