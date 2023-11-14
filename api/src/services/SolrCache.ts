import Config from "../models/Config";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import glob = require("glob");
import path = require("path");

class SolrCache {
    private static instance: SolrCache;
    cacheDir: boolean | string;

    constructor(cacheDir: boolean | string = false) {
        this.cacheDir = cacheDir;
    }

    public static getInstance(): SolrCache {
        if (!SolrCache.instance) {
            const config = Config.getInstance();
            SolrCache.instance = new SolrCache(config.solrDocumentCacheDir);
        }
        return SolrCache.instance;
    }

    /**
     * Returns the path to the PID file in the document cache if caching is enabled, false otherwise.
     *
     * @param pid PID being indexed
     * @returns false | string
     */
    public getDocumentCachePath(pid: string): false | string {
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

    public purgeFromCacheIfEnabled(pid: string): void {
        const cacheFile = this.getDocumentCachePath(pid);
        if (cacheFile !== false && existsSync(cacheFile as string)) {
            rmSync(cacheFile as string);
        }
    }

    public writeToCacheIfEnabled(pid: string, data: string): void {
        // Get filename; if it's false, cache is disabled:
        const file = this.getDocumentCachePath(pid);
        if (file === false) {
            return;
        }

        const dirname = path.dirname(file);
        if (!existsSync(dirname)) {
            mkdirSync(dirname, { recursive: true });
        }
        writeFileSync(file, data);
    }

    /**
     * Returns an array of JSON files in the cache when cache is enabled, false otherwise.
     */
    public getDocumentsFromCache(): Array<string> | false {
        if (this.cacheDir === false) {
            return false;
        }
        let pattern = this.cacheDir + "/**/**/**/*.json";
        const options: Record<string, unknown> = { nocase: true };
        // Special case for Windows -- we need to account for drive letters:
        const colonIndex = pattern.indexOf(":");
        if (colonIndex > -1) {
            options.root = pattern.substring(0, colonIndex + 2);
            pattern = pattern.substring(colonIndex + 1);
        }
        return glob.sync(pattern, options);
    }
}

export default SolrCache;
