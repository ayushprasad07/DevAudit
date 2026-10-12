import {
    createServer,
    type IncomingMessage,
    type Server,
    type ServerResponse,
} from "node:http";

import { timingSafeEqual } from "node:crypto";

import { WorkerAnalysisRequestSchema, type WorkerAnalysisRequest } from "@/types/worker";

const MAX_BODY_BYTES = 1024*1024;

export interface WorkerServerOption{
    sharedSecret : string;
    onJobAccepted : (job : WorkerAnalysisRequest) => Promise<void>;
}

function sendJson(
    response : ServerResponse,
    statusCode : number,
    body : Record<string, unknown>
) : void{
    response.writeHead(statusCode, {
        "Content-Type": "application/json",
    });
    // response.write(JSON.stringify(body));
    response.end(JSON.stringify(body));
}

function hasValidToken(
    authorization : string | undefined,
    sharedSecret : string
) : boolean{
    if (!authorization?.startsWith("Bearer")){
        return false;
    }

    const supplied = Buffer.from(authorization.slice(7));
    const expected = Buffer.from(sharedSecret);

    if (supplied.length !== expected.length){
        return false;
    }

    return timingSafeEqual(supplied, expected);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

        totalBytes += buffer.length;

        if (totalBytes > MAX_BODY_BYTES) {
            throw new Error("BODY_TOO_LARGE");
        }
        chunks.push(buffer);
    }

    const rawBody = Buffer.concat(chunks);

    try {
        return JSON.parse(rawBody.toString("utf-8"));
    } catch {
        throw new Error("INVALID_JSON");
    }
}

export function createWorkerServer(
    options : WorkerServerOption
): Server{
    if (!options.sharedSecret){
        throw new Error("Work shared secret is required");
    } 

    return createServer(async(request,response) => {
        if (request.method !== "POST" || request.url !== "/jobs") {
                sendJson(response, 404, {
                status: "error",
                message: "Route not found",
            });
            return;
        }

        if (!hasValidToken(request.headers.authorization, options.sharedSecret)){
            sendJson(response, 401, {
                status: "error",
                message: "Unauthorized",
            });
            return;
        }

        if (!request.headers["content-type"]?.includes("application/json")){
            sendJson(response, 415, {
                status: "error",
                message: "Content-Type must be application/json",
            });
            return;
        }

        let body : unknown;

        try {
            body = await readJsonBody(request);
        } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message === "BODY_TOO_LARGE") {
                sendJson(response, 413, {
                status: "error",
                message: "Request body too large",
                });
            } else {
                sendJson(response, 400, {
                status: "error",
                message: "Invalid JSON body",
                });
            }

            return;
        }

        const parsed = WorkerAnalysisRequestSchema.safeParse(body);

        if (!parsed.success) {
            sendJson(response, 400, {
                status: "error",
                message: "Invalid worker request",
                issues: parsed.error.issues,
            });
            return;
        }

        try {
            await options.onJobAccepted(parsed.data);

            sendJson(response, 202, {
                status: "accepted",
                jobId: parsed.data.jobId,
                contractVersion: parsed.data.contractVersion,
            });
        } catch (error) {
            sendJson(response, 503, {
                status: "error",
                message: "Worker could not accept the job",
            });
        }
    });
}