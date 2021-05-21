import { Job as QueueJob } from "bullmq";
import fs = require("fs");
import path = require("path");
import Category from "../models/Category";
import { DatastreamParameters, FedoraObject } from "../models/FedoraObject";
import ImageFile from "../models/ImageFile";
import Job from "../models/Job";
import Page from "../models/Page";
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

    async addDatastreamsToPage(page: Page, imageData: FedoraObject): Promise<void> {
        const image = new ImageFile(this.job.dir + "/" + page.filename);
        imageData.addDatastreamFromFile(image.filename, "MASTER", "image/tiff");
        imageData.addMasterMetadataDatastream();
        for (const size in image.sizes) {
            imageData.addDatastreamFromFile(await image.derivative(size), size, "image/jpeg");
        }
        if (this.category.supportsOcr) {
            imageData.addDatastreamFromFile(await image.ocr(), "OCR-DIRTY", "text/plain");
        }
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

    async addPages(pageList): Promise<void> {
        const order = this.job.metadata.order.pages;
        for (const i in order) {
            const page = order[i];
            const number = parseInt(i) + 1;
            this.logger.info("Adding " + number + " of " + order.length + " - " + page.filename);
            const imageData = this.buildPage(pageList, page, number);
            await this.addDatastreamsToPage(page, imageData);
        }
    }

    addDocuments(documentList) {
        // TODO
    }

    addAudio(audioList) {
        // TODO
    }

    buildPage(pageList: FedoraObject, page: Page, number: number): FedoraObject {
        const imageData = new FedoraObject(FedoraObject.getNextPid());
        imageData.setLogger(this.logger);
        imageData.parentPid = pageList.pid;
        imageData.modelType = "ImageData";
        imageData.title = page.label;
        this.logger.info("Creating Image Object " + imageData.pid);

        imageData.coreIngest("I");
        imageData.dataIngest();
        imageData.imageDataIngest();

        imageData.addSequenceRelationship(pageList.pid, number);

        return imageData;
    }

    buildPageList(resource) {
        const pageList = new FedoraObject(FedoraObject.getNextPid());
        pageList.setLogger(this.logger);
        pageList.parentPid = resource.pid;
        pageList.modelType = "ListCollection";
        pageList.title = "Page List";
        this.logger.info("Creating Page List Object " + pageList.pid);

        pageList.coreIngest("I");
        pageList.collectionIngest();
        pageList.listCollectionIngest();

        return pageList;
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

    async buildResource(holdingArea): Promise<FedoraObject> {
        const resource = new FedoraObject(FedoraObject.getNextPid());
        resource.setLogger(this.logger);
        resource.parentPid = holdingArea.pid;
        resource.modelType = "ResourceCollection";
        resource.title = "Incomplete... / Processing...";
        this.logger.info("Creating Resource Object " + resource.pid);

        resource.coreIngest("I");
        resource.collectionIngest();
        resource.resourceCollectionIngest();

        // Attach thumbnail to resource:
        if (this.job.metadata.order.pages.length > 0) {
            const page = this.job.metadata.order.pages[0];
            const image = new ImageFile(this.job.dir + "/" + page.filename);
            resource.addDatastreamFromFile(await image.derivative("THUMBNAIL"), "THUMBNAIL", "image/jpeg");
        }
        return resource;
    }

    finalizeTitle(resource) {
        const title = this.job.dir.substr(1).split("/").reverse().join("_");
        this.logger.info("Updating title to " + title);
        resource.modifyObject(title, null, null, "Set Label to ingest/process path", null);

        const dc = resource.datastreamDissemination("DC");
        this.replaceDCMetadata(
            resource,
            dc.replace(/Incomplete... \/ Processing.../, title),
            "Set dc:title to ingest/process path"
        );
    }

    replaceDCMetadata(resource: FedoraObject, dc: string, message: string) {
        this.logger.info(message);
        const params: DatastreamParameters = {
            mimeType: "text/xml",
            logMessage: message,
        };
        resource.modifyDatastream("DC", params, dc);
    }

    moveDirectory() {
        // TODO
    }

    async run(): Promise<void> {
        const startTime = Date.now();
        this.logger.info("Beginning ingest.");
        this.logger.info("Target col// TODOlection ID: " + this.category.targetCollectionId);
        const holdingArea = new FedoraObject(this.category.targetCollectionId);
        holdingArea.setLogger(this.logger);
        if (holdingArea.sort == "custom") {
            // This was already a TODO in the Ruby code; low priority:
            throw "TODO: implement custom sort support.";
        }

        const resource = await this.buildResource(holdingArea);

        // TODO: deal with ordered collection sequence numbers, if needed
        // (this was already a TODO in the Ruby code; low priority)

        if (this.job.metadata.order.pages.length > 0) {
            await this.addPages(this.buildPageList(resource));
        }

        if (this.job.metadata.documents.list.length > 0 || this.category.supportsPdfGeneration) {
            this.addDocuments(this.buildDocumentList(resource));
        }

        if (this.job.metadata.audio.list.length > 0) {
            this.addAudio(this.buildAudioList(resource));
        }

        this.finalizeTitle(resource);
        if (this.job.metadata.dc.length > 0) {
            this.replaceDCMetadata(resource, this.job.metadata.dc, "Loading DC XML");
        }

        this.moveDirectory();

        const elapsed = (Date.now() - startTime) / 60000;
        this.logger.info("Done. Total time: " + elapsed + " minute(s).");
    }
}

class Ingest implements QueueJobInterface {
    async run(job: QueueJob): Promise<void> {
        const handler = new IngestProcessor(job.data.dir);
        await handler.run();
    }
}

export default Ingest;
