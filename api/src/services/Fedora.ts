import { IncomingMessage } from "http";
import Config from "../models/Config";
import http = require("needle");
import N3 = require("n3");
import crypto = require("crypto");
const { DataFactory } = N3;
const { namedNode, literal } = DataFactory;
import xmlescape = require("xml-escape");

export interface DatastreamParameters {
    dsLabel?: string;
    dsState?: string;
    mimeType?: string;
    logMessage?: string;
}

interface NeedleResponse extends IncomingMessage {
    body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    raw: Buffer;
    bytes: number;
}

interface Attributes {
    [key: string]: string;
}

export interface DC {
    name: string;
    value: string;
    attributes: Attributes;
    children: Array<DC>;
}

export class Fedora {
    baseUrl: string;
    cache: Record<string, Record<string, string>> = {};

    constructor() {
        const config = Config.getInstance();
        this.baseUrl = config.restBaseUrl;
    }

    /**
     * Make authenticated request to Fedora
     *
     * @param method Request method
     * @param _path URL
     * @param data POST data
     * @param _options Additional needle options
     */
    protected _request(
        method = "get",
        _path = "/",
        data: string | Buffer = null,
        _options: Record<string, unknown> = {}
    ): Promise<NeedleResponse> {
        const path = _path[0] == "/" ? _path.slice(1) : _path;
        const url = this.baseUrl + "/" + path;

        // Basic Auth
        const auth = {
            username: Config.getInstance().fedoraUsername,
            password: Config.getInstance().fedoraPassword,
        };
        const options = Object.assign({}, auth, _options);
        return http(method, url, data, options);
    }

    /**
     * Get RDF about a PID in Fedora
     *
     * @param pid PID to look up
     */
    async getRdf(pid: string, allowCaching = true): Promise<string> {
        const cacheKey = "RDF";
        let data = allowCaching ? this.getCache(pid, cacheKey) : null;
        if (!data) {
            const options = {
                parse_response: false,
                headers: { Accept: "application/rdf+xml" },
            };
            const result = await this._request("get", pid, null, options);
            data = result.body.toString();
            if (allowCaching) {
                this.setCache(pid, cacheKey, data);
            }
        }
        return data;
    }

    protected getCache(pid: string, key: string): string {
        if (typeof this.cache[pid] === "undefined" || typeof this.cache[pid][key] === "undefined") {
            return null;
        }
        return this.cache[pid][key];
    }

    protected setCache(pid: string, key: string, data: string): void {
        if (typeof this.cache[pid] === "undefined") {
            this.cache[pid] = {};
        }
        this.cache[pid][key] = data;
    }

    async getDatastreamAsString(pid: string, datastream: string, allowCaching = true): Promise<string> {
        const cacheKey = "stream_" + datastream;
        let data = allowCaching ? this.getCache(pid, cacheKey) : null;
        if (!data) {
            data = (await this.getDatastream(pid, datastream)).body.toString();
            if (allowCaching) {
                this.setCache(pid, cacheKey, data);
            }
        }
        return data;
    }

    /**
     * Get datastream from Fedora
     *
     * @param pid Record id
     * @param datastream Which stream to request
     * @param parse Parse JSON (true) or return raw (false, default)
     */
    async getDatastream(
        pid: string,
        datastream: string,
        requestOptions = { parse_response: false }
    ): Promise<NeedleResponse> {
        return await this._request(
            "get",
            pid + "/" + datastream,
            null, // Data
            requestOptions
        );
    }

    /**
     * Get DC datastream from Fedora
     *
     * Cast to DC type
     *
     * @param pid Record id
     */
    async getDC(pid: string, allowCaching = true): Promise<DC> {
        const cacheKey = "DC";
        const data = allowCaching ? this.getCache(pid, cacheKey) : null;
        if (data) {
            // If we found data in the cache, we need to decode it:
            return JSON.parse(data);
        }
        const requestOptions = { parse_response: true };
        const dublinCore = <DC>(await this.getDatastream(pid, "DC", requestOptions)).body;
        if (allowCaching) {
            // The cache stores strings, so we need to encode our DC data to JSON:
            this.setCache(pid, cacheKey, JSON.stringify(dublinCore));
        }
        return dublinCore;
    }

    /**
     * Write a datastream to Fedora.
     *
     * @param pid            Object containing datastream
     * @param stream         Name of stream
     * @param mimeType       MIME type of data
     * @param expectedStatus Expected HTTP response code (otherwise, we'll fail)
     * @param data           Content to write to stream
     */
    async putDatastream(
        pid: string,
        stream: string,
        mimeType: string,
        expectedStatus: number,
        data: string | Buffer
    ): Promise<void> {
        const md5 = crypto.createHash("md5").update(data).digest("hex");
        const sha = crypto.createHash("sha512").update(data).digest("hex");
        const options = {
            headers: {
                "Content-Disposition": 'attachment; filename="' + stream + '"',
                "Content-Type": mimeType,
                Digest: "md5=" + md5 + ", sha-512=" + sha,
            },
        };
        const targetPath = "/" + pid + "/" + stream;
        const response = await this._request("put", targetPath, data, options);
        if (response.statusCode !== expectedStatus) {
            throw new Error("Expected " + expectedStatus + " Created response, received: " + response.statusCode);
        }
    }

    /**
     * Add a datastream to Fedora.
     *
     * @param pid    Object containing datastream
     * @param stream Name of stream
     * @param params Additional parameters
     * @param data   Content to write to stream
     */
    async addDatastream(
        pid: string,
        stream: string,
        params: DatastreamParameters,
        data: string | Buffer
    ): Promise<void> {
        // First create the stream:
        await this.putDatastream(pid, stream, params.mimeType, 201, data);

        // Now set appropriate metadata:
        const writer = new N3.Writer({ format: "text/turtle" });
        writer.addQuad(
            namedNode(""),
            namedNode("http://fedora.info/definitions/1/0/access/objState"),
            literal(params.dsState ?? "A")
        );
        writer.addQuad(
            namedNode(""),
            namedNode("http://purl.org/dc/terms/title"),
            literal(params.dsLabel ?? pid.replace(":", "_") + "_" + stream)
        );
        const turtle = this.getTurtleFromWriter(writer);
        const targetPath = "/" + pid + "/" + stream + "/fcr:metadata";
        const patchResponse = await this.patchRdf(targetPath, turtle);
        if (patchResponse.statusCode !== 204) {
            throw new Error("Expected 204 No Content response, received: " + patchResponse.statusCode);
        }
    }

    /**
     * Change the label of a container
     *
     * @param pid   PID of object to modify
     * @param title New label to apply
     */
    async modifyObjectLabel(pid: string, title: string): Promise<void> {
        const writer = new N3.Writer({ format: "text/turtle" });
        this.addLabelToContainerGraph(writer, title);
        const insertClause = this.getTurtleFromWriter(writer);
        const deleteClause =
            "<> <http://purl.org/dc/terms/title> ?any ; <info:fedora/fedora-system:def/model#label> ?any .";
        const whereClause = "?id <http://purl.org/dc/terms/title> ?any";
        const response = await this.patchRdf("/" + pid, insertClause, deleteClause, whereClause);
        if (response.statusCode !== 204) {
            throw new Error("Expected 204 No Content response, received: " + response.statusCode);
        }
    }

    /**
     * Patch the RDF of a resource in Fedora.
     *
     * @param targetPath   Fedora path to patch
     * @param insertClause RDF to insert
     * @param deleteClause RDF delete conditions (optional)
     * @param whereClause  RDF where clause (optional)
     */
    async patchRdf(
        targetPath: string,
        insertClause: string,
        deleteClause = "",
        whereClause = ""
    ): Promise<NeedleResponse> {
        const options = {
            headers: {
                "Content-Type": "application/sparql-update",
            },
        };
        const update =
            (deleteClause.length === 0 ? "" : "DELETE { " + deleteClause + " }") +
            (insertClause.length === 0 ? "" : " INSERT { " + insertClause + " }") +
            " WHERE { " +
            whereClause +
            " }";
        return this._request("patch", targetPath, update, options);
    }

    /**
     * Get the Turtle output from an N3.Writer object.
     *
     * @param writer N3.Writer that has already been populated with RDF.
     */
    getTurtleFromWriter(writer: N3.Writer): string {
        let data = "";
        writer.end((error, result) => {
            if (error) {
                throw new Error("Problem writing Turtle.");
            }
            data = result;
        });
        if (data.length === 0) {
            throw new Error("RDF graph generation failed!");
        }
        return data;
    }

    /**
     * Add appropriate label/title properties to an RDF graph representing a container.
     *
     * @param writer N3 RDF writer
     * @param label  Title to add to graph
     */
    addLabelToContainerGraph(writer: N3.Writer, label: string): void {
        writer.addQuad(namedNode(""), namedNode("http://purl.org/dc/terms/title"), literal(label));
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#label"), literal(label));
    }

    /**
     * Create a container in the repository
     *
     * @param pid Record id
     * @param label Label
     * @param state Object state (A = Active, I = Inactive)
     * @param owner Object owner
     */
    async createContainer(pid: string, label: string, state: string, owner = "diglibEditor"): Promise<void> {
        const writer = new N3.Writer({ format: "text/turtle" });
        this.addLabelToContainerGraph(writer, label);
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#state"), literal(state));
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#ownerId"), literal(owner));
        const options = {
            headers: {
                "Content-Type": "text/turtle",
            },
        };
        const response = await this._request("put", "/" + pid, this.getTurtleFromWriter(writer), options);
        if (response.statusCode !== 201) {
            throw new Error("Expected 201 Created response, received: " + response.statusCode);
        }
        // Now create DC datastream:
        const xml =
            '<oai_dc:dc xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">' +
            "\n" +
            "  <dc:title>" +
            xmlescape(label) +
            "</dc:title>\n" +
            "</oai_dc:dc>\n";
        const params: DatastreamParameters = {
            mimeType: "text/xml",
            logMessage: "Create initial Dublin Core record",
        };
        await this.addDatastream(pid, "DC", params, xml);
    }
}

export default Fedora;
