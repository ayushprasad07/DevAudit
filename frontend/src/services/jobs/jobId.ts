import { randomUUID } from "crypto";

export function generateJobId(): string {
  return `job_${randomUUID()}`;
}