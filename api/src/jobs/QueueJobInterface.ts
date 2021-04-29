import { Job } from "bullmq";

export default interface QueueJob {
    run(job: Job): Promise<void>;
}
