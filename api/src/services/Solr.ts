import http = require("needle");
import { IncomingMessage } from "http";

// TODO: Now shared with Fedora.ts
interface NeedleResponse extends IncomingMessage {
    body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    raw: Buffer;
    bytes: number;
}

class Solr {
    baseUrl: string;

    constructor() {
        // TODO: make configurable
        this.baseUrl = "http://localhost:8983/solr";
    }

    /**
     * Make request to Solr
     */
    protected _request(
        method = "get",
        _path = "/",
        data: string = null,
        options: Record<string, unknown> = {}
    ): Promise<NeedleResponse> {
        const path = _path[0] == "/" ? _path.slice(1) : _path;
        const url = this.baseUrl + "/" + path;
        console.log(method, url, data);
        return http(method, url, data, options);
    }

    async indexRecord(core: string, _data: Record<string, unknown>): Promise<NeedleResponse> {
        const data = JSON.stringify({ add: { doc: _data } });
        const headers = {
            headers: { "Content-Type": "application/json" },
        };
        return this._request("post", core + "/update?commit=true", data, headers);
    }
}

export default Solr;
