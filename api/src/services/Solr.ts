import http = require("needle");
import { NeedleResponse } from "./interfaces";
import Config from "../models/Config";

class Solr {
    private static instance: Solr;
    cacheDir: boolean | string;
    baseUrl: string;

    constructor(baseUrl: string, cacheDir: boolean | string = false) {
        this.baseUrl = baseUrl;
        this.cacheDir = cacheDir;
    }

    public static getInstance(): Solr {
        if (!Solr.instance) {
            const config = Config.getInstance();
            Solr.instance = new Solr(config.solrUrl, config.solrDocumentCacheDir);
        }
        return Solr.instance;
    }

    /**
     * Make request to Solr
     */
    protected _request(
        method = "get",
        _path = "/",
        data: string = null,
        options: Record<string, unknown> = {},
        log = false,
    ): Promise<NeedleResponse> {
        const path = _path[0] == "/" ? _path.slice(1) : _path;
        const url = this.baseUrl + "/" + path;
        if (log) {
            console.log(method, url, data);
        }
        return http(method, url, data, options);
    }

    public async query(
        core: string,
        solrQuery: string,
        queryParams: Record<string, string> = {},
        log = false,
    ): Promise<NeedleResponse> {
        const formatter = ([key, val]) => {
            return "&" + encodeURIComponent(key) + "=" + encodeURIComponent(val);
        };
        const extras = Object.entries(queryParams).map(formatter).join("");
        return this._request("get", core + "/select?q=" + encodeURIComponent(solrQuery) + extras, null, {}, log);
    }

    /**
     * Returns the path to the PID file in the document cache if caching is enabled, false otherwise.
     *
     * @param pid PID being indexed
     * @returns boolean | string
     */
    protected getDocumentCachePath(pid: string): boolean | string {
        if (this.cacheDir === false) {
            return false;
        }
        // Create a file path that will prevent too many files from being stored in the
        // same directory together:
        const [namespace, number] = pid.split(":");
        const paddedNumber = "0000000000" + number;
        const len = paddedNumber.length;
        const chunk1 = paddedNumber.substring(len - 9, len - 6);
        const chunk2 = paddedNumber.substring(len - 6, len - 3);
        const chunk3 = paddedNumber.substring(len - 3, len);
        return `${this.cacheDir}/${namespace}/${chunk1}/${chunk2}/${chunk3}/${number}.json`;
    }

    public async deleteRecord(core: string, pid: string): Promise<NeedleResponse> {
        // Strip double quotes from PID -- they should never be present, and it protects
        // against malicious query manipulation.
        const data = JSON.stringify({ delete: { query: 'id:"' + pid.replace(/["]/g, "") + '"' } });
        const cacheFile = this.getDocumentCachePath(pid);
        if (cacheFile !== false) {
            console.log(cacheFile);
        }
        return this.updateSolr(core, data);
    }

    public async indexRecord(core: string, _data: Record<string, unknown>): Promise<NeedleResponse> {
        const data = JSON.stringify({ add: { doc: _data } });
        const cacheFile = this.getDocumentCachePath(_data.id as string);
        if (cacheFile !== false) {
            console.log(cacheFile);
        }
        return this.updateSolr(core, data);
    }

    protected async updateSolr(core: string, data: string): Promise<NeedleResponse> {
        const headers = {
            headers: { "Content-Type": "application/json" },
        };
        return this._request("post", core + "/update?commit=true", data, headers);
    }
}

export default Solr;
