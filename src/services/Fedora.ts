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
        data: object = null
    ): Promise<NeedleResponse> {
        let path = _path[0] == "/" ? _path.slice(1) : _path;
        let url = this.baseUrl + "/" + path;

        // TODO: Config
        const headers = {
            username: "fedoraAdmin", // Basic Auth
            password: "fedoraAdmin",
        };

        return http("get", url, null, headers);
    }

    /**
     * Get datastream from Fedora
     */
    async getDatastream(pid, datastream): Promise<any> {
        try {
            let res = await this._request("get", pid + "/" + datastream);
            return res.body;
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
        return <DC> (<unknown> this.getDatastream(pid, "DC"));
    }
}

export default Fedora;
