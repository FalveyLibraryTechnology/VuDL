import Arena = require("bull-arena");
import { Queue, FlowProducer } from "bullmq";
import Config from "../models/Config";

const config = Config.getInstance();
const connection = config.redisConnectionSettings;

const queue = Arena({
    BullMQ: Queue,
    FlowBullMQ: FlowProducer,
    queues: [
        {
            type: "bullmq",
            name: config.redisDefaultQueueName,
            hostId: connection.host ?? "localhost",
            port: connection.port ?? 6379,
            password: connection.password ?? null,
        },
    ],
});

export default queue;
