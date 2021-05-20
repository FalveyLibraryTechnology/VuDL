import { Job as QueueJob } from "bullmq";
import fs = require("fs");
import path = require("path");
import Category from "../models/Category";
import FedoraObject from "../models/FedoraObject";
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
        this.logger.info("Adding Flac");
        // TODO: Add Flac
        this.logger.info("Adding MP3");
        // TODO: Add MP3
        this.logger.info("Adding OGG");
        // TODO: Add OGG
    }

    addPages(pageList) {
        const order = this.job.metadata.order.pages;
        for (const i in order) {
            const page = order[i];
            this.logger.info("Adding " + (parseInt(i) + 1) + " of " + order.length + " - " + page.filename);
            const imageData = this.buildPage(pageList, page, i + 1);
            this.addDatastreamsToPage(page, imageData);
        }
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
        const title = this.job.dir.substr(1).split("/").reverse().join("_");
        this.logger.info("Updating title to " + title);
        // TODO: resource.modifyObject(title, null, null, "Set Label to ingest/process path", null);

        const dc = ""; // TODO: resource.datastreamDissemination("DC");
        this.replaceDCMetadata(
            resource,
            dc.replace(/Incomplete... \/ Processing.../, title),
            "Set dc:title to ingest/process path"
        );
    }

    replaceDCMetadata(resource, dc, message) {
        this.logger.info(message);
        /* TODO:
        resource.modifyDatastream(
            "DC",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "text/xml",
            message,
            null,
            null,
            dc
        );
        */
    }

    moveDirectory() {
        // TODO
    }

    run(): void {
        const startTime = Date.now();
        this.logger.info("Beginning ingest.");
        this.logger.info("Target collection ID: " + this.category.targetCollectionId);
        const holdingArea = new FedoraObject(this.category.targetCollectionId);
        if (holdingArea.sort == "custom") {
            // This was already a TODO in the Ruby code; low priority:
            throw "TODO: implement custom sort support."
        }

        const resource = this.buildResource(holdingArea);

        // TODO: deal with ordered collection sequence numbers, if needed
        // (this was already a TODO in the Ruby code; low priority)

        if (this.job.metadata.order.pages.length > 0) {
            this.addPages(this.buildPageList(resource));
        }

        if (this.job.metadata.documents.list.length > 0 || this.category.supportsPdfGeneration) {
            this.addDocuments(this.buildDocumentList(resource));
        }

        if (this.job.metadata.audio.list.length > 0) {
            this.addAudio(this.buildAudioList(resource));
        }

        this.finalizeTitle(resource);

        /* TODO: make this work
        if (this.job.metadata.dc.length > 0) {
            this.replaceDCMetadata(resource, this.job.metadata.dc, "Loading DC XML");
        }
         */

        this.moveDirectory();

        const elapsed = (Date.now() - startTime) / 60000;
        this.logger.info("Done. Total time: " + elapsed + " minute(s).");
    }
}

class Ingest implements QueueJobInterface {
    async run(job: QueueJob): Promise<void> {
        const handler = new IngestProcessor(job.data.dir);
        handler.run();
    }
}

export default Ingest;
