import { IncomingMessage } from "http";
const http = require("needle");

interface NeedleResponse extends IncomingMessage {
    body: any;
    raw: Buffer;
    bytes: number;
}

interface Attributes {
    [key: string]: string;
}

interface JSON {
    [key: string]: string | JSON;
}

interface DC {
    name: string;
    value: string;
    attributes: Attributes;
    children: Array<DC>;
}

class Fedora {
    baseUrl: string;

    constructor() {
        // TODO: Config
        this.baseUrl = "http://vua6743.villanova.edu:8089/rest";
    }

    /**
     * Make authenticated request to Fedora
     */
    protected _request(
        method: string = "get",
        _path: string = "/",
        data: object = null,
        _options: object = {}
    ): Promise<NeedleResponse> {
        let path = _path[0] == "/" ? _path.slice(1) : _path;
        let url = this.baseUrl + "/" + path;

        // TODO: Config
        const auth = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin",
        };
        let options = Object.assign({}, auth, _options);

        return http(method, url, data, options);
    }

    /**
     * Get datastream from Fedora
     */
    async getDatastream(pid, datastream, parse = false): Promise<any> {
        try {
            let res = await this._request(
                "get",
                pid + "/" + datastream,
                null, // Data
                { // Options
                    parse_response: parse,
                }
            );

            if (parse) {
                return res.body;
            }
            return res.body.toString(); // Buffer to string
        } catch (e) {
            console.log("Fedora::getDatastream '" + datastream + "' failed", e);
        }
    }

    /**
     * Get DC datastream from Fedora
     *
     * Cast to DC type
     */
    async getDC(pid): Promise<DC> {
        return <DC> (<unknown> this.getDatastream(pid, "DC", true));
    }
}

export default Fedora;
