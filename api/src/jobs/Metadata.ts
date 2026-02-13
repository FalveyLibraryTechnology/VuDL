import { Job as QueueJob } from "bullmq";
import fs = require("fs");
import Config from "../models/Config";
import { FedoraObject } from "../models/FedoraObject";
import FedoraObjectFactory from "../services/FedoraObjectFactory";
import QueueJobInterface from "./QueueJobInterface";

class MetadataProcessor {
    protected pid: string;
    protected config: Config;
    protected objectFactory: FedoraObjectFactory;

    constructor(pid: string, config: Config, objectFactory: FedoraObjectFactory) {
        this.config = config;
        this.objectFactory = objectFactory;
        this.pid = pid;
    }

    public static build(pid: string): MetadataProcessor {
        return new MetadataProcessor(pid, Config.getInstance(), FedoraObjectFactory.getInstance());
    }

    async addMasterMetadataDatastream(): Promise<void> {
        const fedoraObject: FedoraObject = FedoraObject.build(this.pid, null, this.config);
        // Stream the MASTER datastream directly to a temporary file to avoid
        // buffering very large files into memory, then run FITS on that file.
        const contentPath = await fedoraObject.downloadDatastreamToTempFile("MASTER");
        await fedoraObject.addMasterMetadataDatastream(contentPath);
        fs.truncateSync(contentPath, 0);
        fs.rmSync(contentPath);
        // FITS XML will have been generated in /tmp as a side-effect; clean it up:
        fs.truncateSync(contentPath + ".fits.xml", 0);
        fs.rmSync(contentPath + ".fits.xml");
    }

    async run(): Promise<void> {
        await this.addMasterMetadataDatastream();
    }
}

class Metadata implements QueueJobInterface {
    async run(job: QueueJob): Promise<void> {
        console.log("Adding metadata...", job.data);
        const handler = MetadataProcessor.build(job.data.pid);
        await handler.run();
    }
}

export default Metadata;
