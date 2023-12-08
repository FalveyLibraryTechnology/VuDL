import { Job } from "bullmq";
import QueueJob from "./QueueJobInterface";
import QueueManager from "../services/QueueManager";
import SolrIndexer from "../services/SolrIndexer";
import SolrCache from "../services/SolrCache";

class Index implements QueueJob {
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async isFirstMatchingJob(job) {
        const matchingJobs = await QueueManager.getInstance().getActiveIndexJobsForPid(job.data.pid);
        let isFirst = true;
        (await matchingJobs).forEach((activeJob) => {
            if (parseInt(activeJob.id) < parseInt(job.id)) {
                isFirst = false;
            }
        });
        return isFirst;
    }

    protected async waitForEarlierIndexersToComplete(job): Promise<void> {
        let tries = 0;
        const maxTries = 60; // wait for up to a minute
        while (!(await this.isFirstMatchingJob(job))) {
            console.log("Waiting for an earlier job to complete...");
            await this.sleep(1000);
            if (++tries >= maxTries) {
                throw new Error("Exceeded retries waiting for queue to clear");
            }
        }
    }

    async run(job: Job): Promise<void> {
        if (typeof job?.data?.pid === "undefined") {
            throw new Error("No pid provided!");
        }

        // We don't want a race condition where two workers are indexing the same
        // job at the same time, and an earlier version of the data gets written after
        // a later version. If multiple jobs are working on the same pid at once, we
        // need to wait so that the work gets done in the proper order.
        await this.waitForEarlierIndexersToComplete(job);

        console.log("Indexing...", job?.data);
        const indexer = SolrIndexer.getInstance();

        // Unlock the PID if it is locked so subsequent jobs can be queued:
        const cache = SolrCache.getInstance();

        let indexOperation = null;
        switch (job.data.action) {
            case "delete":
                indexOperation = async () => await indexer.deletePid(job.data.pid);
                break;
            case "index":
                indexOperation = async () => await indexer.indexPid(job.data.pid);
                break;
            default:
                throw new Error("Unexpected index action: " + job.data.action);
        }

        // Unlock the PID before we start work, so if changes occur while we are
        // working, they get queued up appropriately.
        cache.unlockPidIfEnabled(job.data.pid, job.data.action);

        // Attempt to index inside a retry loop, so if various problems occur, we
        // have a chance of automatically recovering and proceeding with the indexing.
        const maxAttempts = 3;
        let attempt = 0;
        while (attempt++ < maxAttempts) {
            try {
                const result = await indexOperation();
                if (result.statusCode !== 200) {
                    const msg =
                        `Problem performing ${job.data.action} on ${job.data.pid}: ` +
                        (((result.body ?? {}).error ?? {}).msg ?? "unspecified error");
                    throw new Error(msg);
                }
                return;
            } catch (e) {
                // Always log the error
                console.error(e);
                // If we're not on our last attempt, retry; otherwise, rethrow
                if (attempt < maxAttempts) {
                    console.error("Retrying...");
                    await this.sleep(500);
                } else {
                    throw e;
                }
            }
        }
    }
}

export default Index;
