import fs = require("fs");
import winston = require("winston");
import Config from "./Config";
import { DatastreamParameters, Fedora } from "../services/Fedora";
import { getNextPid } from "../services/Database";

export interface ObjectParameters {
    label?: string;
    format?: string;
    encoding?: string;
    namespace?: string;
    ownerId?: string;
    logMessage?: string;
    ignoreMime?: boolean;
    lastModifiedDate?: string;
    state?: string;
}

export class FedoraObject {
    public modelType: string;
    public pid: string;
    public parentPid: string;
    public title: string;
    protected fedora: Fedora;
    protected logger: winston.Logger;

    constructor(pid: string, logger: winston.Logger = null) {
        this.pid = pid;
        this.fedora = new Fedora();
        this.logger = logger;
    }

    static async getNextPid(): Promise<string> {
        return getNextPid(Config.getInstance().pidNamespace);
    }

    get namespace(): string {
        return Config.getInstance().pidNamespace;
    }

    async addDatastream(id: string, params: DatastreamParameters, data: string | Buffer): Promise<void> {
        this.log(
            params.logMessage ?? "Adding datastream " + id + " to " + this.pid + " with " + data.length + " bytes"
        );
        await this.fedora.addDatastream(this.pid, id, params, data);
    }

    async addDatastreamFromFile(filename: string, stream: string, mimeType: string): Promise<void> {
        await this.addDatastreamFromStringOrBuffer(fs.readFileSync(filename), stream, mimeType);
    }

    async addDatastreamFromStringOrBuffer(contents: string | Buffer, stream: string, mimeType: string): Promise<void> {
        if (mimeType === "text/plain" && contents.length === 0) {
            contents = "\n"; // workaround for 500 error on empty OCR
        }
        const params: DatastreamParameters = {
            dsLabel: this.pid.replace(":", "_") + "_" + stream,
            dsState: "A",
            mimeType: mimeType,
            logMessage: "Initial Ingest addDatastream - " + stream,
        };
        await this.addDatastream(stream, params, contents);
    }

    async addMasterMetadataDatastream(): Promise<void> {
        const params = {
            dsLabel: this.pid.replace(":", "_") + "_MASTER-MD",
            dsState: "A",
            mimeType: "text/xml",
            logMessage: "Initial Ingest addDatastream - MASTER-MD",
        };
        await this.addDatastream("MASTER-MD", params, this.fitsMasterMetadata());
    }

    addRelationship(subject: string, predicate: string, obj: string, isLiteral = false, datatype: string = null): void {
        this.log("Adding relationship " + [subject, predicate, obj].join(" ") + " to " + this.pid);
        // TODO
        console.log("TODO - use these:", isLiteral, datatype);
    }

    addModelRelationship(model: string): void {
        this.addRelationship(
            "info:fedora/" + this.pid,
            "info:fedora/fedora-system:def/model#hasModel",
            "info:fedora/vudl-system:" + model
        );
    }

    addSequenceRelationship(parentPid: string, position: number): void {
        this.addRelationship(
            "info:fedora/" + this.pid,
            "http://vudl.org/relationships#sequence",
            parentPid + "#" + position,
            true
        );
    }

    addSortRelationship(sort: string): void {
        this.addRelationship("info:fedora/" + this.pid, "http://vudl.org/relationships#sortOn", sort, true);
    }

    collectionIngest(): void {
        this.log("Collection ingest for " + this.pid);
        this.addModelRelationship("CollectionModel");
        // TODO: add MEMBER-QUERY and MEMBER-LIST-RAW datastreams if needed (probably not)
    }

    async coreIngest(objectState: string): Promise<void> {
        this.log("Core ingest for " + this.pid);
        await this.fedora.createContainer(this.pid, this.title, objectState, "diglibEditor");
        this.addModelRelationship("CoreModel");
        this.addRelationship(
            "info:fedora/" + this.pid,
            "info:fedora/fedora-system:def/relations-external#isMemberOf",
            "info:fedora/" + this.parentPid
        );
        // TODO: add PARENT-QUERY, PARENT-LIST-RAW and PARENT-LIST datastreams if needed (probably not).
    }

    dataIngest(): void {
        this.addModelRelationship("DataModel");
    }

    async datastreamDissemination(datastream: string): Promise<string> {
        return this.fedora.getDatastreamAsString(this.pid, datastream);
    }

    fitsMasterMetadata(): string {
        // TODO
        return "TODO";
    }

    imageDataIngest(): void {
        this.addModelRelationship("ImageData");
    }

    documentDataIngest(): void {
        this.addModelRelationship("PDFData");
    }

    audioDataIngest(): void {
        this.addModelRelationship("AudioData");
    }

    listCollectionIngest(): void {
        this.addModelRelationship("ListCollection");
        this.addSortRelationship("custom");
    }

    modifyDatastream(id: string, params: DatastreamParameters, data: string): void {
        this.log("Updating datastream " + id + " on " + this.pid + " with " + data.length + " bytes");
        // TODO
        console.log("TODO - use these:", params);
    }

    modifyObject(params: ObjectParameters): void {
        this.log("Modifying " + this.pid);
        // TODO
        console.log("TODO - use these:", params);
    }

    resourceCollectionIngest(): void {
        this.log("Resource collection ingest for " + this.pid);
        this.addModelRelationship("ResourceCollection");
        this.addSortRelationship("title");
        // TODO: original Ruby code had some TODOs about adding more parameters
        // here; perhaps this should be revisited in the future.
    }

    log(message: string): void {
        if (this.logger) {
            this.logger.info(message);
        }
    }

    get sort(): string {
        // TODO: fetch sort value from RELS-EXT or equivalent, instead of hard-coding
        return "title";
    }
}
