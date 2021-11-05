import Arena = require("bull-arena");
import { Queue, FlowProducer } from "bullmq";

const queue = Arena({
    BullMQ: Queue,
    FlowBullMQ: FlowProducer,
    queues: [
        {
            // TODO: make this configurable through vudl.ini
            type: "bullmq",
            name: "vudl",
            hostId: "localhost",
        },
    ],
});

export default queue;
