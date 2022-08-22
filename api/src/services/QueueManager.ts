import { Queue, Job, Worker, WorkerOptions, Processor } from "bullmq";
import Config from "../models/Config";

class QueueManager {
    private static instance: QueueManager;
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager(Config.getInstance());
        }
        return QueueManager.instance;
    }

    protected get queueBaseOptions(): Record<string, Record<string, string>> {
        return {
            connection: this.config.redisConnectionSettings,
        };
    }

    protected getQueue(queueName: string = null): Queue {
        return new Queue(queueName ?? this.config.redisDefaultQueueName, this.queueBaseOptions);
    }

    public getWorker(callback: Processor, queueName: string = null): Worker {
        const options = this.queueBaseOptions as WorkerOptions;
        options.lockDuration = this.config.redisLockDuration;
        return new Worker(queueName ?? this.config.redisDefaultQueueName, callback, options);
    }

    protected async addToQueue(jobName: string, data: Record<string, string>, queueName: string = null): Promise<void> {
        const q = this.getQueue(queueName);
        await q.add(jobName, data);
        q.close();
    }

    public async buildDerivatives(dir: string): Promise<void> {
        return await this.addToQueue("derivatives", { dir });
    }

    public async generatePdf(pid: string): Promise<void> {
        return await this.addToQueue("generatepdf", { pid });
    }

    public async ingestJob(dir: string): Promise<void> {
        return await this.addToQueue("ingest", { dir });
    }

    public async performIndexOperation(pid: string, action: string): Promise<void> {
        // Fedora often fires many change events about the same object in rapid succession;
        // we don't want to index more times than we have to, so let's not re-queue anything
        // that is already awaiting indexing.
        const q = this.getQueue();
        const jobs = await q.getJobs("wait");
        const queueJob = { pid, action };
        if (this.isAlreadyAwaitingAction(jobs, "index", queueJob)) {
            console.log("Skipping queue; " + pid + " is already awaiting " + action + ".");
        } else {
            await q.add("index", { pid, action });
        }
        q.close();
    }

    isAlreadyAwaitingAction(jobs: Array<Job>, name: string, { pid, action }: { pid: string; action: string }): boolean {
        const matchingJob = jobs.find((job) => {
            return job.name === name && job.data.pid === pid;
        });
        return matchingJob ? matchingJob?.data?.action === action : false;
    }

    public async queueMetadataOperation(pid: string, action: string): Promise<void> {
        const q = this.getQueue();
        const jobs = await q.getJobs("wait");
        const queueJob = { pid, action };
        if (this.isAlreadyAwaitingAction(jobs, "metadata", queueJob)) {
            console.log("Skipping queue; " + pid + " is already awaiting " + action + ".");
        } else {
            await q.add("metadata", queueJob);
        }
        q.close();
    }
}

export default QueueManager;
