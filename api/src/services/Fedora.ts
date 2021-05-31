import { IncomingMessage } from "http";
import Config from "../models/Config";
import http = require("needle");

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
        data: Record<string, unknown> = null,
        _options: Record<string, unknown> = {}
    ): Promise<NeedleResponse> {
        const path = _path[0] == "/" ? _path.slice(1) : _path;
        const url = this.baseUrl + "/" + path;

        // TODO: Config
        const auth = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin",
        };
        const options = Object.assign({}, auth, _options);
        return http(method, url, data, options);
    }

    /**
     * Get RDF about a PID in Fedora
     *
     * @param pid PID to look up
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getRdf(pid: string, parse = false): Promise<any> {
        if (typeof this.cache[pid] === "undefined") {
            this.cache[pid] = {};
        }
        if (typeof this.cache[pid]["__rdf"] === "undefined") {
            try {
                const res = await this._request(
                    "get",
                    pid,
                    null, // Data
                    {
                        // Options
                        parse_response: parse,
                        headers: { Accept: "application/rdf+xml" },
                    }
                );

                this.cache[pid]["__rdf"] = parse ? res.body : res.body.toString(); // Buffer to string
            } catch (e) {
                console.log(e);
                throw "RDF retrieval failed for " + pid;
            }
        }
        return this.cache[pid]["__rdf"];
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
}

export default Fedora;
