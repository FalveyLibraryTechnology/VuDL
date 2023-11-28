import { Job } from "bullmq";
import QueueJob from "./QueueJobInterface";
import SolrIndexer from "../services/SolrIndexer";
import SolrCache from "../services/SolrCache";

class Index implements QueueJob {
    async run(job: Job): Promise<void> {
        console.log("Indexing...", job?.data);
        if (typeof job?.data?.pid === "undefined") {
            throw new Error("No pid provided!");
        }
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
