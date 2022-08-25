import { Queue, Job } from "bullmq";

class QueueManager {
    private static instance: QueueManager;
    protected defaultQueueName = "vudl";

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    protected async addToQueue(jobName: string, data: Record<string, string>, queueName: string = null): Promise<void> {
        const q = new Queue(queueName ?? this.defaultQueueName);
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

    public async performIndexOperation(pid: string, action: string, force = false): Promise<void> {
        // Fedora often fires many change events about the same object in rapid succession;
        // we don't want to index more times than we have to, so let's not re-queue anything
        // that is already awaiting indexing.
        const q = new Queue(this.defaultQueueName);
        const jobs = await q.getJobs("wait");
        const queueJob = { pid, action };
        if (!force && this.isAlreadyAwaitingAction(jobs, "index", queueJob)) {
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
        const q = new Queue(this.defaultQueueName);
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
