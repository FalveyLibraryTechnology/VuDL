import fs = require("fs");

export interface DatastreamParameters {
    checksumType?: string;
    controlGroup?: string;
    dsLabel?: string;
    dsState?: string;
    mimeType?: string;
    logMessage?: string;
    versionable?: boolean;
}

export class FedoraObject {
    public pid: string;
    protected logger;

    constructor(pid: string) {
        this.pid = pid;
    }

    addDatastream(id: string, params: DatastreamParameters, data: string) {
        this.log("Adding datastream " + id + " to " + this.pid);
        // TODO: Add the datastream!
    }

    addDatastreamFromFile(filename: string, stream: string, mimeType: string) {
        return this.addDatastreamFromString(fs.readFileSync(filename).toString(), stream, mimeType);
    }

    addDatastreamFromString(contents: string, stream: string, mimeType: string, checksumType = "MD5") {
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

    addMasterMetadataDatastream() {
        // TODO: fill in appropriate params
        const params = {};
        this.addDatastream("MASTER-MD", params, this.fitsMasterMetadata());
    }

    addRelationship(subject: string, predicate: string, obj: string, isLiteral = false, datatype: string = null) {
        this.log("Adding relationship " + [subject, predicate, obj].join(" ") + " to " + this.pid);
        // TODO
    }

    addModelRelationship(model) {
        this.addRelationship(
            "info:fedora/" + this.pid,
            "info:fedora/fedora-system:def/model#hasModel",
            "info:fedora/vudl-system:" + model
        );
    }

    addSequenceRelationship(parentPid, position) {
        this.addRelationship(
            "info:fedora/" + this.pid,
            "http://vudl.org/relationships#sequence",
            parentPid + "#" + position,
            true
        );
    }

    addSortRelationship(sort) {
        this.addRelationship("info:fedora/" + this.pid, "http://vudl.org/relationships#sortOn", sort, true);
    }

    collectionIngest() {
        this.log("Collection ingest for " + this.pid);
        // TODO
    }

    coreIngest() {
        this.log("Core ingest for " + this.pid);
        // TODO
    }

    dataIngest() {
        this.addModelRelationship("DataModel");
    }

    datastreamDissemination(datastream, asOfDataTime = null, download = null): string {
        // TODO
        return "TODO";
    }

    fitsMasterMetadata(): string {
        // TODO
        return "TODO";
    }

    imageDataIngest() {
        this.addModelRelationship("ImageData");
    }

    documentDataIngest() {
        this.addModelRelationship("PDFData");
    }

    audioDataIngest() {
        this.addModelRelationship("AudioData");
    }

    ingest(label, format, encoding, namespace, ownerId, logMessage, ignoreMime, xml) {
        const targetPid = xml ? "new" : this.pid;
        this.log("Ingest for " + targetPid);
        // TODO
    }

    listCollectionIngest() {
        this.addModelRelationship("ListCollection");
        this.addSortRelationship("custom");
    }

    modifyDatastream(id, params, data) {
        this.log("Updating datastream " + id + " on " + this.pid);
        // TODO
    }

    modifyObject(label, ownerId, state, logMessage, lastModifiedDate) {
        this.log("Modifying " + this.pid);
        // TODO
    }

    resourceCollectionIngest() {
        this.log("Resource collection ingest for " + this.pid);
        this.addModelRelationship("ResourceCollection");
        this.addSortRelationship("title");
        // TODO: original Ruby code had some TODOs about adding more parameters
        // here; perhaps this should be revisited in the future.
    }

    log(message: string) {
        if (this.logger) {
            this.logger.info(message);
        }
    }

    setLogger(logger) {
        this.logger = logger;
    }

    get sort(): string {
        // TODO: fetch sort value from RELS-EXT or equivalent, instead of hard-coding
        return "title";
    }
}