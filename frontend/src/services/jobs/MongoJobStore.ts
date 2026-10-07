import { Collection } from "mongodb"

import type { Job } from "@/types/jobs"
import type { JobStore } from "./JobStore"

import { getDb } from "@/lib/mongodb"

export class MongoJobStore implements JobStore{
    private async getCollection () : Promise<Collection<Job>>{
        const db = await getDb();

        return db.collection<Job>("jobs");
    }

    async create(job : Job) : Promise<void>{
        const collection = await this.getCollection();

        await collection.insertOne(job);
    }

    async get(jobId : string) : Promise<Job | undefined>{
        const collection = await this.getCollection();

        const job = await collection.findOne({
            jobId
        },{
            projection : {
                _id : 0
            }
        });

        return job ?? undefined;
    }

    async update(job : Job): Promise<void>{
        const collection = await this.getCollection();

        await collection.replaceOne({
            jobId : job.jobId
        }, job);
    }
}