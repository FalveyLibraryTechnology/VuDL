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
    cache: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    constructor() {
        const config = Config.getInstance();
        this.baseUrl = config.restBaseUrl();
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
     * Get datastream from Fedora
     *
     * @param pid Record id
     * @param datastream Which stream to request
     * @param parse Parse JSON (true) or return raw (false, default)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getDatastream(pid: string, datastream: string, parse = false): Promise<any> {
        if (typeof this.cache[pid] === "undefined") {
            this.cache[pid] = {};
        }
        if (typeof this.cache[pid][datastream] === "undefined") {
            try {
                const res = await this._request(
                    "get",
                    pid + "/" + datastream,
                    null, // Data
                    {
                        // Options
                        parse_response: parse,
                    }
                );

                this.cache[pid][datastream] = parse ? res.body : res.body.toString(); // Buffer to string
            } catch (e) {
                console.log("Fedora::getDatastream '" + datastream + "' failed", e);
            }
        }
        return this.cache[pid][datastream];
    }

    /**
     * Get DC datastream from Fedora
     *
     * Cast to DC type
     *
     * @param pid Record id
     */
    async getDC(pid: string): Promise<DC> {
        return <DC>(<unknown>this.getDatastream(pid, "DC", true));
    }
}

export default Fedora;
