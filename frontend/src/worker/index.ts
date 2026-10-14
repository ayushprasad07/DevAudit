import { createWorkerServer } from "./server";
import { WorkerStatusClient } from "./WorkerStatusClient";
import { processJob } from "./processJob";

const port = Number(process.env.WORKER_PORT ?? 4000);
const sharedSecret = process.env.WORKER_SHARED_SECRET;
const nextAppUrl = process.env.NEXT_APP_URL;

if (!nextAppUrl) {
    throw new Error("NEXT_APP_URL environment variable is required");
}

if (!sharedSecret) {
  throw new Error("WORKER_SHARED_SECRET environment variable is required");
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("WORKER_PORT must be a valid port number");
}

const statusClient = new WorkerStatusClient(nextAppUrl, sharedSecret);

const server = createWorkerServer({
    sharedSecret,
    onJobAccepted: async (job) => {
        setImmediate(() => {
            void processJob(job, statusClient);
        });
        console.log(`Worker accepted job: ${job.jobId}`);
    },
});

server.listen(port, "127.0.0.1", ()=>{
    console.log(`DevAudit worker listening on http://127.0.0.1:${port}`);
});

function shutdown(){
    server.close(error =>{
        if (error){
            console.error("Error shutting down worker:", error);
            process.exitCode = 1;
        }
    })
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);