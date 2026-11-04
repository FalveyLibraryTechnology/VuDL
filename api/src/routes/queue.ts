import Arena = require("bull-arena");
import { Queue, FlowProducer } from "bullmq";
import Config from "../models/Config";

const config = Config.getInstance();
const connection = config.redisConnectionSettings;

const queueNames = new Set<string>([config.redisDefaultQueueName]);
Object.values(config.redisQueueJobMap).forEach((queue) => {
    queueNames.add(queue);
});

class ArenaQueue extends Queue {
    get client() {
        // BullMQ 6 removed the public client method, but Arena still expects it; this shim works around the issue:
        return this.getBackend().client;
    }
}

const queue = Arena({
    BullMQ: ArenaQueue,
    FlowBullMQ: FlowProducer,
    queues: Array.from(queueNames).map((name) => {
        return {
            type: "bullmq",
            name,
            hostId: connection.host ?? "localhost",
            port: connection.port ?? 6379,
            password: connection.password ?? null,
        };
    }),
});

export default queue;
