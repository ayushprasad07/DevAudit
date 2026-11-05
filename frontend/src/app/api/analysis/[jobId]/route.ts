import { NextResponse } from "next/server";

import { JobManager } from "@/services/jobs/JobManager";
import { MongoJobStore } from "@/services/jobs/MongoJobStore";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await context.params;

    if (!jobId || !jobId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Job ID is required",
        },
        { status: 400 },
      );
    }

    const manager = new JobManager(new MongoJobStore());

    const job = await manager.get(jobId);

    if (!job){
        return NextResponse.json(
        {
          success: false,
          message: "Job not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
        success : true,
        job
    },{
        status : 200
    })

  } catch (error) {
    console.log("Error retirieving analysis job: ", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve analysis job",
      },
      {
        status: 500,
      },
    );
  }
}
