import { Job as QueueJob } from "bullmq";
import fs = require("fs");
import path = require("path");
import AudioFile from "../models/AudioFile";
import Category from "../models/Category";
import Config from "../models/Config";
import { DatastreamParameters, FedoraObject } from "../models/FedoraObject";
import DocumentFile from "../models/DocumentFile";
import ImageFile from "../models/ImageFile";
import Job from "../models/Job";
import Page from "../models/Page";
import QueueJobInterface from "./QueueJobInterface";
import winston = require("winston");

class IngestProcessor {
    protected job: Job;
    protected category: Category;
    protected logger: winston.Logger;

    constructor(dir: string) {
        this.job = new Job(dir);
        this.category = new Category(path.dirname(dir));
        this.logger = winston.createLogger({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
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

    addDatastreamsToDocument(document: DocumentFile, documentData: FedoraObject): void {
        documentData.addDatastreamFromFile(this.job.dir + "/" + document.filename, "MASTER", "application/pdf");
        documentData.addMasterMetadataDatastream();
    }

    addDatastreamsToAudio(audio: AudioFile, audioData: FedoraObject) {
        this.logger.info("Adding Flac");
        audioData.addDatastreamFromFile(this.job.dir + "/" + audio.filename, "MASTER", "audio/x-flac");
        this.logger.info("Adding MP3");
        audioData.addDatastreamFromFile(audio.derivative("MP3"), "MP3", "audio/mpeg");
        this.logger.info("Adding OGG");
        audioData.addDatastreamFromFile(audio.derivative("OGG"), "OGG", "audio/ogg");
        audioData.addMasterMetadataDatastream();
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

    addDocuments(documentList: FedoraObject): void {
        let order = this.job.metadata.documents.list;
        if (order.length == 0 && this.category.supportsPdfGeneration) {
            this.logger.info("Generating PDF");
            order = [new DocumentFile(path.basename(this.job.generatePdf()), "PDF")];
        }
        for (const i in order) {
            const document = order[i];
            const number = parseInt(i) + 1;
            this.logger.info("Adding " + number + " of " + order.length + " - " + document.filename);
            const data = this.buildDocument(documentList, document, number);
            this.addDatastreamsToDocument(document, data);
        }
    }

    addAudio(audioList) {
        const order = this.job.metadata.audio.list;
        for (const i in order) {
            const audio = order[i];
            const number = parseInt(i) + 1;
            this.logger.info("Adding " + number + " of " + order.length + " - " + audio.filename);
            const audioData = this.buildAudio(audioList, audio, number);
            this.addDatastreamsToAudio(audio, audioData);
        }
    }

    buildPage(pageList: FedoraObject, page: Page, number: number): FedoraObject {
        const imageData = new FedoraObject(FedoraObject.getNextPid(), this.logger);
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
        const pageList = new FedoraObject(FedoraObject.getNextPid(), this.logger);
        pageList.parentPid = resource.pid;
        pageList.modelType = "ListCollection";
        pageList.title = "Page List";
        this.logger.info("Creating Page List Object " + pageList.pid);

        pageList.coreIngest("I");
        pageList.collectionIngest();
        pageList.listCollectionIngest();

        return pageList;
    }

    buildDocument(documentList: FedoraObject, document: DocumentFile, number: number): FedoraObject {
        const documentData = new FedoraObject(FedoraObject.getNextPid(), this.logger);
        documentData.parentPid = documentList.pid;
        documentData.modelType = "PDFData";
        documentData.title = document.label;
        this.logger.info("Creating Document Object " + documentData.pid);

        documentData.coreIngest("I");
        documentData.dataIngest();
        documentData.documentDataIngest();

        documentData.addSequenceRelationship(documentList.pid, number);

        return documentData;
    }

    buildDocumentList(resource: FedoraObject): FedoraObject {
        const documentList = new FedoraObject(FedoraObject.getNextPid(), this.logger);
        documentList.parentPid = resource.pid;
        documentList.modelType = "ListCollection";
        documentList.title = "Document List";
        this.logger.info("Creating Document List Object " + documentList.pid);

        documentList.coreIngest("I");
        documentList.collectionIngest();
        documentList.listCollectionIngest();

        return documentList;
    }

    buildAudio(audioList: FedoraObject, audio: AudioFile, number: number): FedoraObject {
        const audioData = new FedoraObject(FedoraObject.getNextPid(), this.logger);
        audioData.parentPid = audioList.pid;
        audioData.modelType = "AudioData";
        audioData.title = audio.filename;
        this.logger.info("Creating Audio Object " + audioData.pid);

        audioData.coreIngest("I");
        audioData.dataIngest();
        audioData.audioDataIngest();

        audioData.addSequenceRelationship(audioList.pid, number);

        return audioData;
    }

    buildAudioList(resource: FedoraObject): FedoraObject {
        const audioList = new FedoraObject(FedoraObject.getNextPid(), this.logger);
        audioList.parentPid = resource.pid;
        audioList.modelType = "ListCollection";
        audioList.title = "Audio List";
        this.logger.info("Creating Audio List Object " + audioList.pid);

        audioList.coreIngest("I");
        audioList.collectionIngest();
        audioList.listCollectionIngest();

        return audioList;
    }

    async buildResource(holdingArea): Promise<FedoraObject> {
        const resource = new FedoraObject(FedoraObject.getNextPid(), this.logger);
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
        const basePath = Config.getInstance().processedAreaPath();
        const currentTime = new Date();
        const now = currentTime.toISOString().substr(0, 10);
        let target = basePath + "/" + now + "/" + this.category.name + "/" + this.job.name;
        if (fs.existsSync(target)) {
            let i = 2;
            while (fs.existsSync(target + "." + i)) {
                i++;
            }
            target = target + "." + i;
        }
        this.logger.info("Moving " + this.job.dir + " to " + target);
        // TODO: move the directory and clean up (original Ruby below):
        //FileUtils.mkdir_p target unless File.exist?(target)
        //FileUtils.mv Dir.glob("#{@job.dir}/*"), target
        //FileUtils.rmdir @job.dir
        //FileUtils.rm "#{target}/ingest.lock"
    }

    async run(): Promise<void> {
        const startTime = Date.now();
        this.logger.info("Beginning ingest.");
        this.logger.info("Target collection ID: " + this.category.targetCollectionId);
        const holdingArea = new FedoraObject(this.category.targetCollectionId, this.logger);
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
        this.logger.close(); // Release file handle on log.
    }
}

class Ingest implements QueueJobInterface {
    async run(job: QueueJob): Promise<void> {
        const handler = new IngestProcessor(job.data.dir);
        await handler.run();
    }
}

export default Ingest;
