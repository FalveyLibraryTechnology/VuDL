import { SolrAddDoc, SolrCache } from "./SolrCache";
import * as fs from "fs";
import glob = require("glob");

describe("SolrCache", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("has a factory", () => {
        expect(SolrCache.getInstance()).toBeInstanceOf(SolrCache);
    });

    it("is disabled by default", () => {
        const cache = new SolrCache();
        expect(cache.getDocumentCachePath("vudl:123")).toBeFalsy();
        expect(cache.getDocumentsFromCache()).toBeFalsy();
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementation(jest.fn());
        const mkdirSpy = jest.spyOn(fs, "mkdirSync").mockImplementation(jest.fn());
        const writeFileSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(jest.fn());
        const rmSpy = jest.spyOn(fs, "rmSync").mockImplementation(jest.fn());
        cache.purgeFromCacheIfEnabled("vudl:123");
        cache.writeToCacheIfEnabled("vudl:123", "foo");
        cache.exportCombinedFiles("/bar", 2);
        expect(existsSpy).not.toHaveBeenCalled();
        expect(mkdirSpy).not.toHaveBeenCalled();
        expect(writeFileSpy).not.toHaveBeenCalled();
        expect(rmSpy).not.toHaveBeenCalled();
    });

    it("purges files when enabled and they exist", () => {
        const cache = new SolrCache("/foo");
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(true);
        const rmSpy = jest.spyOn(fs, "rmSync").mockImplementation(jest.fn());
        cache.purgeFromCacheIfEnabled("vudl:123");
        const expectedPath = "/foo/vudl/000/000/123/123.json";
        expect(existsSpy).toHaveBeenCalledWith(expectedPath);
        expect(rmSpy).toHaveBeenCalledWith(expectedPath);
    });

    it("doesn't purge non-existent files when enabled", () => {
        const cache = new SolrCache("/foo");
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const rmSpy = jest.spyOn(fs, "rmSync").mockImplementation(jest.fn());
        cache.purgeFromCacheIfEnabled("vudl:12345678901");
        const expectedPath = "/foo/vudl/345/678/901/12345678901.json";
        expect(existsSpy).toHaveBeenCalledWith(expectedPath);
        expect(rmSpy).not.toHaveBeenCalled();
    });

    it("writes to cache when enabled", () => {
        const cache = new SolrCache("/foo");
        const expectedDirName = "/foo/vudl/000/000/123";
        const expectedPath = expectedDirName + "/123.json";
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const mkdirSpy = jest.spyOn(fs, "mkdirSync").mockImplementation(jest.fn());
        const writeFileSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(jest.fn());
        cache.writeToCacheIfEnabled("vudl:123", "foo");
        expect(existsSpy).toHaveBeenCalledWith(expectedDirName);
        expect(mkdirSpy).toHaveBeenCalledWith(expectedDirName, { recursive: true });
        expect(writeFileSpy).toHaveBeenCalledWith(expectedPath, "foo");
    });

    it("retrieves documents from the cache", () => {
        const cache = new SolrCache("/foo");
        const fakeOutput = ["foo", "bar"];
        const globSpy = jest.spyOn(glob, "sync").mockReturnValue(fakeOutput);
        const list = cache.getDocumentsFromCache();
        expect(list).toEqual(fakeOutput);
        expect(globSpy).toHaveBeenCalledWith("/foo/**/**/**/*.json", { nocase: true });
    });

    it("retrieves documents from the cache using Windows-style paths", () => {
        const cache = new SolrCache("c:/foo");
        const fakeOutput = ["foo", "bar"];
        const globSpy = jest.spyOn(glob, "sync").mockReturnValue(fakeOutput);
        const list = cache.getDocumentsFromCache();
        expect(list).toEqual(fakeOutput);
        expect(globSpy).toHaveBeenCalledWith("/foo/**/**/**/*.json", { nocase: true, root: "c:/" });
    });

    it("exports and combines the cache", () => {
        const cache = new SolrCache("/foo");
        const docsSpy = jest
            .spyOn(cache, "getDocumentsFromCache")
            .mockReturnValue(["/foo/one", "/foo/two", "/foo/three"]);
        const readSpy = jest.spyOn(cache, "readSolrAddDocFromFile").mockImplementation((file: string): SolrAddDoc => {
            return { add: { doc: { file } } };
        });
        const existsSpy = jest.spyOn(fs, "existsSync").mockReturnValue(true);
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(jest.fn());
        const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
        cache.exportCombinedFiles("/bar", 2);
        expect(docsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(3);
        expect(existsSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledTimes(2);
        expect(writeSpy).toHaveBeenCalledWith("/bar/one", '[{"file":"/foo/one"},{"file":"/foo/two"}]');
        expect(writeSpy).toHaveBeenCalledWith("/bar/three", '[{"file":"/foo/three"}]');
        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith("Starting batch /bar/one");
        expect(logSpy).toHaveBeenCalledWith("Starting batch /bar/three");
    });

    it("skips and reports bad files while exporting", () => {
        const cache = new SolrCache("/foo");
        const docsSpy = jest
            .spyOn(cache, "getDocumentsFromCache")
            .mockReturnValue(["/foo/one", "/foo/two", "/foo/three"]);
        const readSpy = jest.spyOn(cache, "readSolrAddDocFromFile").mockImplementation(jest.fn());
        const existsSpy = jest.spyOn(fs, "existsSync").mockImplementation(jest.fn());
        const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(jest.fn());
        const logSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
        const errorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
        cache.exportCombinedFiles("/bar", 2);
        expect(docsSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledTimes(3);
        expect(existsSpy).not.toHaveBeenCalled();
        expect(writeSpy).not.toHaveBeenCalled();
        expect(logSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledTimes(3);
        expect(errorSpy).toHaveBeenCalledWith("Fatal error: Unexpected data in /foo/one");
        expect(errorSpy).toHaveBeenCalledWith("Fatal error: Unexpected data in /foo/two");
        expect(errorSpy).toHaveBeenCalledWith("Fatal error: Unexpected data in /foo/three");
    });
});
