import { Job, Worker } from "bullmq";
import Derivative from "../jobs/Derivative";
import GeneratePdf from "../jobs/GeneratePdf";
import Index from "../jobs/Index";
import Ingest from "../jobs/Ingest";
import Metadata from "../jobs/Metadata";
import QueueJob from "../jobs/QueueJobInterface";
import QueueManager from "./QueueManager";

class JobQueue {
    workers: { [key: string]: QueueJob } = {};
    manager: Worker;
    queueManager: QueueManager;

    constructor(queueManager: QueueManager) {
        this.queueManager = queueManager;
    }

    start(): void {
        this.workers.derivatives = new Derivative();
        this.workers.generatepdf = new GeneratePdf();
        this.workers.index = new Index();
        this.workers.ingest = new Ingest();
        this.workers.metadata = new Metadata();
        this.manager = this.queueManager.getWorker(async (job) => {
            console.log("JOB: " + job.name);
            if (typeof this.workers[job.name] === "undefined") {
                console.error("Unidentified job from queue: " + job.name);
                return;
            }

            return await this.workers[job.name].run(job);
        });
        this.manager.on("failed", (job: Job, failedReason: string) => {
            console.error("Job failed; reason: " + failedReason);
        });

        console.log("JobQueue started");
    }
}

export default JobQueue;
