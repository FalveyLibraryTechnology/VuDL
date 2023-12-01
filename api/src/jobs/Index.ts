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

    async run(job: Job): Promise<void> {
        if (typeof job?.data?.pid === "undefined") {
            throw new Error("No pid provided!");
        }

        // We don't want a race condition where two workers are indexing the same
        // job at the same time, and an earlier version of the data gets written after
        // a later version. If multiple jobs are working on the same pid at once, we
        // need to wait so that the work gets done in the proper order.
        let tries = 0;
        const maxTries = 60; // wait for up to a minute
        while (!(await this.isFirstMatchingJob(job))) {
            console.log("Waiting for an earlier job to complete...");
            await this.sleep(1000);
            if (++tries >= maxTries) {
                throw new Error("Exceeded retries waiting for queue to clear");
            }
        }

        console.log("Indexing...", job?.data);
        const indexer = SolrIndexer.getInstance();

        // Unlock the PID if it is locked so subsequent jobs can be queued:
        const cache = SolrCache.getInstance();

        let result = null;
        switch (job.data.action) {
            case "delete":
                cache.unlockPidIfEnabled(job.data.pid, job.data.action);
                result = await indexer.deletePid(job.data.pid);
                break;
            case "index":
                cache.unlockPidIfEnabled(job.data.pid, job.data.action);
                result = await indexer.indexPid(job.data.pid);
                break;
            default:
                throw new Error("Unexpected index action: " + job.data.action);
        }
        if (result.statusCode !== 200) {
            const msg =
                `Problem performing ${job.data.action} on ${job.data.pid}: ` +
                (((result.body ?? {}).error ?? {}).msg ?? "unspecified error");
            console.error(msg);
            throw new Error(msg);
        }
    }
}

export default Index;
