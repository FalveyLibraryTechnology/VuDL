import { Job } from "bullmq";
import QueueJob from "./QueueJobInterface";

import http = require("needle");

class Notify implements QueueJob {
    // #todo: config
    defaultChannel = "falvey-vudl-queue";
    defaultBody = "VUDL queue is finished";

    async run(job: Job): Promise<void> {
        const channel = job.data.channel ?? this.defaultChannel;
        const body = job.data.msg ?? this.defaultBody;

        console.log(`: ntfy (${channel}): ${body}`);

        await http("POST", `https://ntfy.sh/${channel}`, body);
    }
}

export default Notify;
