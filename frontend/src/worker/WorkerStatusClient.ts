type WorkerStatusUpdate =
  | { status: "running" }
  | { status: "completed" }
  | { status: "failed"; error: { code: string; message: string } };

export class WorkerStatusClient {
  constructor(
    private readonly nextAppUrl: string,
    private readonly sharedSecret: string,
  ) {
    if (!nextAppUrl) {
      throw new Error("Next.js application URL is required");
    }

    if (!sharedSecret) {
      throw new Error("Worker authentication secret is required");
    }
  }

  async updateStatus(jobId: string, update: WorkerStatusUpdate): Promise<void> {
    const baseUrl = this.nextAppUrl.replace(/\/+$/, "");
    const url =
      `${baseUrl}/api/internal/worker/jobs/` +
      `${encodeURIComponent(jobId)}/status`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.sharedSecret}`,
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error(
        `Job status update failed with HTTP status ${response.status}`,
      );
    }
  }
}
