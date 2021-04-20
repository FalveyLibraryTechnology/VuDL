// import { Queue } from 'bullmq';
import { Worker } from 'bullmq';

// TODO: Maybe don't load all of them?
import Derivative from '../jobs/Derivative';

class JobQueue {
    // TODO: Type
    workers: any = {};
    manager: Worker;

    start() {
        // TODO: Maybe don't load all of them?
        this.workers.derivatives = new Derivative();

        this.manager = new Worker("vudl", async job => {
            console.log("JOB: "+ job.name);
            if (typeof this.workers[job.name] === "undefined") {
                console.error("Unidentified job from queue: " + job.name);
                return "sadness";
            }

            return await this.workers[job.name].run(job);
        });

        console.log("JobQueue started")
    }
}

export default JobQueue;
