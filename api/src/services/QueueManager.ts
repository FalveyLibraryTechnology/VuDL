import { Queue } from "bullmq";

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

    public async performIndexOperation(pid: string, action: string): Promise<void> {
        // Fedora often fires many change events about the same object in rapid succession;
        // we don't want to index more times than we have to, so let's not re-queue anything
        // that is already awaiting indexing.
        const q = new Queue(this.defaultQueueName);
        const jobs = await q.getJobs("wait");
        let lastPidAction = null;
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].name === "index" && jobs[i].data.pid === pid) {
                lastPidAction = jobs[i].data.action;
                break;
            }
        }
        if (action === lastPidAction) {
            console.log("Skipping queue; " + pid + " is already awaiting " + action + ".");
        } else {
            await q.add("index", { pid, action });
        }
        q.close();
    }
}

export default QueueManager;
