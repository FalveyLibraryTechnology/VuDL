import fs = require("fs");
import winston = require("winston");

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
    protected logger;

    constructor(pid: string, logger: winston.Logger = null) {
        this.pid = pid;
        this.logger = logger;
    }

    static getNextPid(): string {
        // TODO
        return "FAKE";
    }

    get namespace(): string {
        // TODO: make configurable, or eliminate if unneeded
        return "vudl";
    }

    addDatastream(id: string, params: DatastreamParameters, data: string): void {
        this.log("Adding datastream " + id + " to " + this.pid);
        // TODO: Add the datastream!
        console.log("TODO - use these:", id, params, data);
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
        // TODO: fill in appropriate params
        const params = {};
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
        // TODO
    }

    coreIngest(objectState: string): void {
        this.log("Core ingest for " + this.pid);
        this.ingest({
            label: this.title,
            format: "info:fedora/fedora-system:FOXML-1.1",
            encoding: "UTF-8",
            namespace: this.namespace,
            ownerId: "diglibEditor",
            logMessage: this.title + " - ingest",
            ignoreMime: false,
        });
        this.modifyObject({
            state: objectState,
            logMessage: "Set initial state",
        });
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

    datastreamDissemination(datastream: string, asOfDataTime = null, download = null): string {
        // TODO
        console.log("TODO - use these:", datastream, asOfDataTime, download);
        return "TODO";
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

    ingest(params: ObjectParameters, xml: string = null): void {
        const targetPid = xml ? "new" : this.pid;
        this.log("Ingest for " + targetPid);
        // TODO
        console.log("TODO - use these:", params);
    }

    listCollectionIngest(): void {
        this.addModelRelationship("ListCollection");
        this.addSortRelationship("custom");
    }

    modifyDatastream(id: string, params: DatastreamParameters, data: string): void {
        this.log("Updating datastream " + id + " on " + this.pid);
        // TODO
        console.log("TODO - use these:", params, data);
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
