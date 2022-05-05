import { FedoraObject } from "./FedoraObject";
import { Fedora } from "../services/Fedora";
import MetadataExtractor from "../services/MetadataExtractor";
import * as fs from "fs";
import Config from "../models/Config";

jest.mock("fs");

describe("FedoraObject", () => {
    let fedoraObject: FedoraObject;
    let pid: string;
    let buffer: Buffer;
    let filename: string;
    let stream: string;
    let mimeType: string;
    beforeEach(() => {
        buffer = Buffer.alloc(1024);
        pid = "testPid";
        filename = "test1";
        stream = "test2";
        mimeType = "test3";
        jest.spyOn(fs, "readFileSync").mockReturnValue(buffer);
        jest.spyOn(Config, "getInstance").mockReturnValue(null);
        fedoraObject = FedoraObject.build(pid);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("modifyLicense", () => {
        it("adds a datastream for a license", async () => {
            const config = new Config({
                licenses: {
                    licenseKey1: {
                        uri: "license1Url",
                    },
                },
            });
            const fedora = new Fedora(config);
            fedoraObject = new FedoraObject(pid, config, fedora, MetadataExtractor.getInstance());
            const spy = jest.spyOn(fedoraObject, "addDatastreamFromStringOrBuffer").mockImplementation(jest.fn());

            await fedoraObject.modifyLicense(stream, "licenseKey1");

            expect(spy).toHaveBeenCalledWith(expect.stringContaining("license1Url"), stream, "text/xml", [201, 204]);
        });
    });

    describe("addRelationship", () => {
        it("proxies a call to the fedora service", () => {
            const config = new Config({});
            const fedora = new Fedora(config);
            const spy = jest.spyOn(fedora, "addRelationship").mockImplementation(jest.fn());
            fedoraObject = new FedoraObject(pid, config, fedora, MetadataExtractor.getInstance());
            fedoraObject.addRelationship("subject", "predicate", "object", true);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(pid, "subject", "predicate", "object", true);
        });
    });

    describe("getSort", () => {
        it("defaults to title", async () => {
            const config = new Config({});
            const fedora = new Fedora(config);
            jest.spyOn(fedora, "getRdf").mockResolvedValue("");
            fedoraObject = new FedoraObject(pid, config, fedora, MetadataExtractor.getInstance());
            expect(await fedoraObject.getSort()).toEqual("title");
        });

        it("uses the metadata extractor to obtain data", async () => {
            const config = new Config({});
            const fedora = new Fedora(config);
            const extractor = MetadataExtractor.getInstance();
            const fakeRDF = "<rdf />";
            jest.spyOn(fedora, "getRdf").mockResolvedValue(fakeRDF);
            const extractorSpy = jest.spyOn(extractor, "extractFedoraDetails").mockReturnValue({ sortOn: ["title"] });
            fedoraObject = new FedoraObject(pid, config, fedora, extractor);
            expect(await fedoraObject.getSort()).toEqual("title");
            expect(extractorSpy).toHaveBeenCalledTimes(1);
            expect(extractorSpy).toHaveBeenCalledWith(fakeRDF);
        });
    });

    describe("updateDatastreamFromFile", () => {
        let addDatastreamFromStringOrBufferSpy;
        it("updates datastream and tracks status 201 and 204", async () => {
            addDatastreamFromStringOrBufferSpy = jest.spyOn(fedoraObject, "addDatastreamFromStringOrBuffer");
            addDatastreamFromStringOrBufferSpy.mockResolvedValue({});

            await fedoraObject.updateDatastreamFromFile(filename, stream, mimeType);

            expect(fs.readFileSync).toHaveBeenCalledWith(filename);
            expect(addDatastreamFromStringOrBufferSpy).toHaveBeenCalledWith(buffer, stream, mimeType, [201, 204]);
        });
    });

    describe("getDatastreamMetadata", () => {
        let getRdfSpy;
        it("gets the datastream metadata", async () => {
            getRdfSpy = jest.spyOn(Fedora.prototype, "getRdf").mockResolvedValue("test");

            const metadata = await fedoraObject.getDatastreamMetadata(stream);

            expect(metadata).toEqual("test");
            expect(getRdfSpy).toHaveBeenCalledWith(`${pid}/${stream}/fcr:metadata`);
        });
    });

    describe("deleteDatastream", () => {
        let deleteDatastreamSpy;
        let deleteDatastreamTombstoneSpy;
        it("deletes datastream and tombstone", async () => {
            deleteDatastreamSpy = jest.spyOn(Fedora.prototype, "deleteDatastream").mockImplementation(jest.fn());
            deleteDatastreamTombstoneSpy = jest
                .spyOn(Fedora.prototype, "deleteDatastreamTombstone")
                .mockImplementation(jest.fn());

            await fedoraObject.deleteDatastream(stream);

            expect(deleteDatastreamSpy).toHaveBeenCalledWith(pid, stream);
            expect(deleteDatastreamTombstoneSpy).toHaveBeenCalledWith(pid, stream);
        });
    });

    describe("deleteDatastreamTombstone", () => {
        let deleteDatastreamTombstoneSpy;
        it("deletes tombstone", async () => {
            deleteDatastreamTombstoneSpy = jest
                .spyOn(Fedora.prototype, "deleteDatastreamTombstone")
                .mockImplementation(jest.fn());

            await fedoraObject.deleteDatastreamTombstone(stream);

            expect(deleteDatastreamTombstoneSpy).toHaveBeenCalledWith(pid, stream);
        });
    });
});
