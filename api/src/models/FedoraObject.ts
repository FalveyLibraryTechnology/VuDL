import fs = require("fs");
import winston = require("winston");
import Config from "./Config";
import { DatastreamParameters, Fedora } from "../services/Fedora";
import { DOMParser } from "xmldom";
import { execSync } from "child_process";
import { getNextPid } from "../services/Database";
import xpath = require("xpath");

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
    public pid: string;
    public parentPid: string = null;
    public title: string;
    protected config: Config;
    protected fedora: Fedora;
    protected logger: winston.Logger;

    constructor(pid: string, config: Config, fedora: Fedora, logger: winston.Logger = null) {
        this.pid = pid;
        this.config = config;
        this.fedora = fedora;
        this.logger = logger;
    }

    public static build(pid: string, logger: winston.Logger = null, config: Config = null): FedoraObject {
        return new FedoraObject(pid, config ?? Config.getInstance(), Fedora.getInstance(), logger);
    }

    static async fromNextPid(logger: winston.Logger = null, _config: Config = null): Promise<FedoraObject> {
        const config = _config ?? Config.getInstance();
        const pid = await getNextPid(config.pidNamespace);
        return FedoraObject.build(pid, logger, config);
    }

    get namespace(): string {
        return this.config.pidNamespace;
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
            mimeType: mimeType,
            logMessage: "Initial Ingest addDatastream - " + stream,
        };
        await this.addDatastream(stream, params, contents);
    }

    async addMasterMetadataDatastream(filename: string): Promise<void> {
        const params = {
            mimeType: "text/xml",
            logMessage: "Initial Ingest addDatastream - MASTER-MD",
        };
        const fitsXml = this.fitsMasterMetadata(filename);
        await this.addDatastream("MASTER-MD", params, fitsXml);
    }

    async addRelationship(subject: string, predicate: string, obj: string, isLiteral = false): Promise<void> {
        this.log("Adding relationship " + [subject, predicate, obj].join(" ") + " to " + this.pid);
        return this.fedora.addRelsExtRelationship(this.pid, subject, predicate, obj, isLiteral);
    }

    async addModelRelationship(model: string): Promise<void> {
        return this.addRelationship(
            "info:fedora/" + this.pid,
            "info:fedora/fedora-system:def/model#hasModel",
            "info:fedora/vudl-system:" + model
        );
    }

    async addSequenceRelationship(parentPid: string, position: number): Promise<void> {
        return this.addRelationship(
            "info:fedora/" + this.pid,
            "http://vudl.org/relationships#sequence",
            parentPid + "#" + position,
            true
        );
    }

    async addSortRelationship(sort: string): Promise<void> {
        return this.addRelationship("info:fedora/" + this.pid, "http://vudl.org/relationships#sortOn", sort, true);
    }

    async initialize(objectState: string, model: string, owner = "diglibEditor"): Promise<void> {
        // Determine model type -- everything should be either data or a collection:
        let modelType: string = null;
        if (Object.values(this.config.collectionModels).indexOf("vudl-system:" + model) > -1) {
            modelType = "CollectionModel";
        } else if (Object.values(this.config.dataModels).indexOf("vudl-system:" + model) > -1) {
            modelType = "DataModel";
        } else {
            throw new Error("Unknown model type: " + model);
        }
        this.log("Creating object " + this.pid + " with models CoreModel, " + modelType + ", " + model);
        // Create the object in Fedora:
        await this.fedora.createContainer(this.pid, this.title, objectState, owner);
        // Add the three layers of models -- core (always), the type (data/collection), and the specific model
        await this.addModelRelationship("CoreModel");
        await this.addModelRelationship(modelType);
        await this.addModelRelationship(model);
        // Some collection types always have specific sort orders:
        switch (model) {
            case "ListCollection":
                await this.addSortRelationship("custom");
                break;
            case "FolderCollection":
            case "ResourceCollection":
                await this.addSortRelationship("title");
                break;
        }
        // Attach parent if present:
        if (this.parentPid !== null) {
            await this.addRelationship(
                "info:fedora/" + this.pid,
                "info:fedora/fedora-system:def/relations-external#isMemberOf",
                "info:fedora/" + this.parentPid
            );
        }
    }

    async getDatastream(datastream: string): Promise<string> {
        return this.fedora.getDatastreamAsString(this.pid, datastream);
    }

    fitsMasterMetadata(filename: string): string {
        const targetXml = filename + ".fits.xml";
        if (!fs.existsSync(targetXml)) {
            const fitsCommand = this.config.fitsCommand + " -i " + filename + " -o " + targetXml;
            execSync(fitsCommand);
            if (!fs.existsSync(targetXml)) {
                throw new Error("FITS failed to create " + targetXml);
            }
        }
        return fs.readFileSync(targetXml).toString();
    }

    async modifyDatastream(id: string, params: DatastreamParameters, data: string): Promise<void> {
        if (typeof params.dsLabel !== "undefined" || typeof params.dsState !== "undefined") {
            throw new Error("Unsupported parameter(s) passed to modifyDatastream()");
        }
        this.log(params.logMessage);
        await this.fedora.putDatastream(this.pid, id, params.mimeType, 204, data);
    }

    async modifyObjectLabel(title: string): Promise<void> {
        await this.fedora.modifyObjectLabel(this.pid, title);
    }

    log(message: string): void {
        if (this.logger) {
            this.logger.info(message);
        }
    }

    async getSort(): Promise<string> {
        let sort = "title"; // default
        // If we can find a RELS-EXT, let's check for non-default values:
        const rels = await this.fedora.getDatastreamAsString(this.pid, "RELS-EXT", false, true);
        if (rels.length > 0) {
            const xmlParser = new DOMParser();
            const xml = xmlParser.parseFromString(rels, "text/xml");
            const rdfXPath = xpath.useNamespaces({ "vudl-rel": "http://vudl.org/relationships#" });
            rdfXPath("//vudl-rel:sortOn/text()", xml).forEach((node: Node) => {
                sort = node.nodeValue;
            });
        }
        return sort;
    }
}
