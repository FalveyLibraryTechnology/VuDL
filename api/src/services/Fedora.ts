import { IncomingMessage } from "http";
import Config from "../models/Config";
const http = require("needle");

interface NeedleResponse extends IncomingMessage {
    body: any;
    raw: Buffer;
    bytes: number;
}

interface Attributes {
    [key: string]: string;
}

interface DC {
    name: string;
    value: string;
    attributes: Attributes;
    children: Array<DC>;
}

class Fedora {
    baseUrl: string;
    cache: any = {};

    constructor() {
        const config = Config.getInstance();
        this.baseUrl = config.restBaseUrl();
    }

    /**
     * Make authenticated request to Fedora
     *
     * @param method
     * @param _path
     * @param data
     * @param _options
     */
    protected _request(
        method = "get",
        _path = "/",
        data: object = null,
        _options: object = {}
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
     * @param pid
     * @param datastream
     * @param parse
     */
    async getDatastream(pid, datastream, parse = false): Promise<any> {
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
     * @param pid
     */
    async getDC(pid): Promise<DC> {
        return <DC>(<unknown>this.getDatastream(pid, "DC", true));
    }
}

export default Fedora;
