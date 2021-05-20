import { Job as QueueJob } from "bullmq";
import fs = require("fs");
import path = require("path");
import Category from "../models/Category";
import Job from "../models/Job";
import QueueJobInterface from "./QueueJobInterface";
import winston = require("winston");

class IngestProcessor {
    protected job: Job;
    protected category: Category;
    protected logger;

    constructor(dir: string) {
        this.job = new Job(dir);
        this.category = new Category(path.dirname(dir));
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.simple(),
            transports: [
                new winston.transports.File({ filename: dir + "/ingest.log" }),
                new winston.transports.Console(),
            ],
        });
    }

    addDatastreamsToPage(page, imageData) {
        // TODO
    }

    addDatastreamsToDocument(document, documentData) {
        // TODO
    }

    addDatastreamsToAudio(audio, audioData) {
        // TODO
    }

    addPages(pageList) {
        // TODO
    }

    addDocuments(documentList) {
        // TODO
    }

    addAudio(audioList) {
        // TODO
    }

    buildPage(pageList, page, number) {
        // TODO
    }

    buildPageList(resource) {
        // TODO
    }

    buildDocument(documentList, document, number) {
        // TODO
    }

    buildDocumentList(resource) {
        // TODO
    }

    buildAudio(audioList, audio, number) {
        // TODO
    }

    buildAudioList(resource) {
        // TODO
    }

    buildResource(holdingArea) {
        // TODO
    }

    finalizeTitle(resource) {
        // TODO
    }

    replaceDCMetadata(resource, dc, message) {
        // TODO
    }

    moveDirectory() {
        // TODO
    }

    run(): void {
        // TODO: do something
        this.logger.info("Hello, world! I'm the ingest processor.");
    }
}

class Ingest implements QueueJobInterface {
    async run(job: QueueJob): Promise<void> {
        const handler = new IngestProcessor(job.data.dir);
        handler.run();
    }
}

export default Ingest;
