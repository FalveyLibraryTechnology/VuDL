import { Job } from "bullmq";
import Config from "../models/Config";
import QueueJob from "./QueueJobInterface";

import http = require("needle");

class Notify implements QueueJob {
    async _request(url, body) {
        return http("POST", url, body);
    }

    async run(job: Job): Promise<void> {
        if (!(job.data.msg ?? false)) {
            throw new Error("Notify: no body specified");
        }

        const config = Config.getInstance();

        if (config.notifyMethod !== "ntfy") {
            throw new Error("Notify can only ntfy");
        }

        const channel = job.data.channel ?? config.ntfyConfig.defaultChannel;

        console.log(`: ntfy (${channel}): ${job.data.msg}`);

        await this._request(`https://ntfy.sh/${channel}`, job.data.msg);
    }
}

export default Notify;
