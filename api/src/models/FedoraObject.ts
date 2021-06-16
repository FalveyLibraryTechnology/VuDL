import fs = require("fs");
import winston = require("winston");
import Config from "./Config";
import Fedora from "../services/Fedora";
import { getNextPid } from "../services/Database";

export interface DatastreamParameters {
    checksumType?: string;
    controlGroup?: string;
    dsLabel?: string;
    dsState?: string;
    mimeType?: string;
    logMessage?: string;
    versionable?: boolean;
}

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

    addDatastream(id: string, params: DatastreamParameters, data: string): void {
        this.log("Adding datastream " + id + " to " + this.pid + " with " + data.length + " bytes");
        // TODO: Add the datastream!
        console.log("TODO - use these:", params);
    }

    addDatastreamFromFile(filename: string, stream: string, mimeType: string): void {
        return this.addDatastreamFromString(fs.readFileSync(filename).toString(), stream, mimeType);
    }

    addDatastreamFromString(contents: string, stream: string, mimeType: string, checksumType = "MD5"): void {
        if (mimeType === "text/plain" && contents.length === 0) {
            contents = "\n"; // workaround for 500 error on empty OCR
        }
        const params: DatastreamParameters = {
            controlGroup: "M",
            dsLabel: this.pid.replace(":", "_") + "_" + stream,
            versionable: false,
            dsState: "A",
            checksumType: checksumType,
            mimeType: mimeType,
            logMessage: "Initial Ingest addDatastream - " + stream,
        };
        this.addDatastream(stream, params, contents);
    }

    addMasterMetadataDatastream(): void {
        const params = {
            controlGroup: "M",
            dsLabel: this.pid.replace(":", "_") + "_MASTER-MD",
            versionable: false,
            dsState: "A",
            checksumType: "DISABLED",
            mimeType: "text/xml",
            logMessage: "Initial Ingest addDatastream - MASTER-MD",
        };
        this.addDatastream("MASTER-MD", params, this.fitsMasterMetadata());
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
