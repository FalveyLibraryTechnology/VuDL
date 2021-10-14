import Arena = require("bull-arena");
import { Queue, FlowProducer } from "bullmq";

const arena = Arena({
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

module.exports = arena;
