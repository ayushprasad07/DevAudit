
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { JobManager } from "@/services/jobs/JobManager";
import { MongoJobStore } from "@/services/jobs/MongoJobStore";
import { AnalysisResultSchema } from "@/types/jobs";

const updateWorkerJobSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("running"),
  }),

  z.object({
    status: z.literal("completed"),
    result: AnalysisResultSchema,
  }),

  z.object({
    status: z.literal("failed"),
    error: z.object({
      code: z.string().min(1),
      message: z.string().min(1),
    }),
  }),
]);

function isAuthorized(authorization: string | null): boolean {
  const secret = process.env.WORKER_SHARED_SECRET;

  if (!secret || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  const supplied = Buffer.from(authorization.slice(7));
  const stored = Buffer.from(secret);

  return (
    supplied.length === stored.length &&
    timingSafeEqual(supplied, stored)
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  if (!isAuthorized(request.headers.get("Authorization"))) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Invalid request body",
      },
      { status: 400 }
    );
  }

  const parsed = updateWorkerJobSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Invalid request body",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const { jobId } = await context.params;

  const manager = new JobManager(new MongoJobStore());

  try {
    switch (body.status) {
      case "running":
        await manager.start(jobId);
        break;

      case "completed":
        await manager.complete(jobId, body.result);
        break;

      case "failed":
        await manager.fail(
          jobId,
          body.error.code,
          body.error.message
        );
        break;
    }

    return NextResponse.json(
      {
        success: true,
        status: "updated",
        jobId,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Unable to update job status",
      },
      { status: 409 }
    );
  }
}
