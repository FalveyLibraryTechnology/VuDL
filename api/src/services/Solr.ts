import http = require("needle");
import { NeedleResponse } from "./interfaces";
import Config from "../models/Config";

class Solr {
    baseUrl: string;

    constructor(baseUrl: string = null) {
        this.baseUrl = baseUrl ?? Config.getInstance().solrUrl;
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
