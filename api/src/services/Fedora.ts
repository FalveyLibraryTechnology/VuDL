import { IncomingMessage } from "http";
import Config from "../models/Config";
import http = require("needle");
import N3 = require("n3");
import crypto = require("crypto");
const { DataFactory } = N3;
const { namedNode, literal } = DataFactory;

export interface DatastreamParameters {
    controlGroup?: string;
    dsLabel?: string;
    dsState?: string;
    mimeType?: string;
    logMessage?: string;
    versionable?: boolean;
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
        // TODO: use all the parameters
        const md5 = crypto.createHash("md5").update(data).digest("hex");
        const sha = crypto.createHash("sha512").update(data).digest("hex");
        const options = {
            headers: {
                "Content-Type": params.mimeType,
                Digest: "md5=" + md5 + ", sha-512=" + sha,
            },
        };
        const response = await this._request("put", "/" + pid + "/" + stream, data, options);
        if (response.statusCode !== 201) {
            throw new Error("Expected 201 Created response, received: " + response.statusCode);
        }
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
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#state"), literal(state));
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#label"), literal(label));
        writer.addQuad(namedNode(""), namedNode("info:fedora/fedora-system:def/model#ownerId"), literal(owner));
        let data = "";
        writer.end((error, result) => {
            if (error) {
                throw error;
            }
            data = result;
        });
        if (data.length === 0) {
            throw new Error("RDF graph generation failed!");
        }
        const options = {
            headers: {
                "Content-Type": "text/turtle",
            },
        };
        const response = await this._request("put", "/" + pid, data, options);
        if (response.statusCode !== 201) {
            throw new Error("Expected 201 Created response, received: " + response.statusCode);
        }
    }
}

export default Fedora;
