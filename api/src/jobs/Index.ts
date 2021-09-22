import { Job } from "bullmq";
import QueueJob from "./QueueJobInterface";
import SolrIndexer from "../services/SolrIndexer";

class Index implements QueueJob {
    async run(job: Job): Promise<void> {
        console.log("Indexing...", job.data);
        const indexer = SolrIndexer.getInstance();
        const result = await indexer.indexPid(job.data.pid);
        if (result.statusCode !== 200) {
            const msg =
                "Problem indexing " +
                job.data.pid +
                ": " +
                (((result.body ?? {}).error ?? {}).msg ?? "unspecified error");
            console.error(msg);
            throw new Error(msg);
        }
    }
}

export default Index;
