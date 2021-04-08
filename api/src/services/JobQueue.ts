// import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
const fs = require('fs');

import ImageFile from '../models/ImageFile';
import JobMetadata from '../models/JobMetadata';
import PageOrder from '../models/PageOrder';

class JobQueue {
    // TODO: Type
    workerFuncs: any = {};
    manager: Worker;

    start() {
        this.workerFuncs.derivatives = async job => {
            console.log(": build derivatives: " + job.data.dir);

            // For each page
            let order = PageOrder.fromJob(job.data);
            let generatingPromises = [];
            order.raw.forEach(page => {
                // For each size
                let image = new ImageFile(`${job.data.dir}/${page.filename}`);
                for (let size in image.sizes) {
                    // Check and generate
                    let p = image.derivative(size);
                    generatingPromises.push(p);
                }
            });

            // Wait for all image generation
            Promise.all(generatingPromises)
                .then(() => {
                    // Delete lock file
                    try {
                        console.log(": build derivatives done");
                        let metadata = new JobMetadata(job.data);
                        fs.unlinkSync(metadata.derivativeLockfile);
                    } catch(e) {
                        console.error("lock file not deleted: " + job.data.dir);
                    }
                });
        };

        this.manager = new Worker("vudl", async job => {
            console.log("JOB: "+ job.name);
            if (typeof this.workerFuncs[job.name] === "undefined") {
                console.error("Unidentified job from queue: " + job.name);
                return "sadness";
            }

            return await this.workerFuncs[job.name](job);
        });

        console.log("> JobQueue started.")
    }
}

export default JobQueue;
